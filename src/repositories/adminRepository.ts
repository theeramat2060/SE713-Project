import prisma from '../config/prisma';
import { Admin } from '../models';

export const createAdmin = async (username: string, hashedPassword: string): Promise<Admin> => {
    const result = await prisma.$queryRaw<Admin[]>`
        INSERT INTO "Admin" (username, password)
        VALUES (${username}, ${hashedPassword}) RETURNING id, username, password, created_at
    `;

    return result[0]!;
};

export const findAdminByUsername = async (username: string): Promise<Admin | null> => {
    const result = await prisma.$queryRaw<Admin[]>`
        SELECT id, username, password, created_at
        FROM "Admin"
        WHERE username = ${username}
    `;

    return result[0] ?? null;
};

export const getAdminById = async (id: number): Promise<Admin | null> => {
    const result = await prisma.$queryRaw<Admin[]>`
        SELECT id, username, password, created_at
        FROM "Admin"
        WHERE id = ${id}
    `;

    return result[0] ?? null;
};

export const updateUserRole = async (userId: string, newRole: string): Promise<void> => {
    try {
        // When promoting a voter to EC staff, we need to create an ECStaff record
        // Get the user first
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // If promoting to EC, create an ECStaff record
        if (newRole === 'EC') {
            // Check if ECStaff record already exists
            const existingECStaff = await prisma.eCStaff.findUnique({
                where: { national_id: user.national_id },
            });

            if (existingECStaff) {
                throw new Error('User is already an EC staff member');
            }

            // Find or create an admin to associate with (use admin ID 1 as default)
            const admin = await prisma.admin.findFirst({
                where: { id: 1 },
            });

            if (!admin) {
                // If no admin exists, we can't create EC staff - this is a constraint
                throw new Error('No admin found to associate with EC staff');
            }

            // Create ECStaff record
            await prisma.eCStaff.create({
                data: {
                    admin_id: admin.id,
                    national_id: user.national_id,
                    password: user.password, // Use existing password
                    title: user.title,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    constituency_id: user.constituency_id,
                    status: 'ACTIVE',
                },
            });

            // Optionally delete the user from Voter table or mark as inactive
            // For now, we'll keep the user record but they are now EC staff
        }
    } catch (error) {
        console.error('[updateUserRole] Error:', error);
        throw error;
    }
};


export const addConstituency = async (data:any): Promise<any> => {
    try {
        // Check if district already exists
        const existingDistrict = await prisma.constituency.findFirst({
            where: {
                province: data.province,
                district_number: data.district_number
            }
        });

        if (existingDistrict) {
            throw new Error(`เขต ${data.district_number} ของจังหวัด ${data.province} มีอยู่แล้ว`);
        }

        const result = await prisma.constituency.create({
            data: {
                province: data.province,
                district_number: data.district_number,
                is_closed: data.is_closed ?? false
            }
        });
        return result;
    } catch (error: any) {
        if (error.message.includes('มีอยู่แล้ว')) {
            throw error;
        }
        throw new Error(`ไม่สามารถสร้างเขตได้: ${error.message}`);
    }
};

export const removeConstituency = async (province: string, district_number: number): Promise<void> => {
    try {
        // First, find the constituency to get its ID
        const constituency = await prisma.constituency.findFirst({
            where: {
                province,
                district_number
            }
        });

        if (!constituency) {
            throw new Error(`Constituency not found: ${province} - ${district_number}`);
        }

        // Delete related data in order (respecting foreign keys)
        // 1. Delete votes for candidates in this constituency
        await prisma.vote.deleteMany({
            where: {
                Candidate: {
                    constituency_id: constituency.id
                }
            }
        });

        // 2. Delete candidates in this constituency
        await prisma.candidate.deleteMany({
            where: {
                constituency_id: constituency.id
            }
        });

        // 3. Delete users in this constituency
        await prisma.user.deleteMany({
            where: {
                constituency_id: constituency.id
            }
        });

        // 4. Delete EC staff in this constituency
        await prisma.eCStaff.deleteMany({
            where: {
                constituency_id: constituency.id
            }
        });

        // 5. Finally, delete the constituency
        await prisma.constituency.delete({
            where: {
                id: constituency.id
            }
        });
    } catch (error) {
        throw error;
    }
};

export const createNewUser = async (data: any): Promise<any> => {
    // const result = await prisma.$queryRaw<any[]>`
    //     INSERT INTO "User" (password, national_id, title , first_name, last_name, address, constituency_id)
    //     VALUES (${data.password}, ${data.national_id}, ${data.title}, ${data.first_name}, ${data.last_name}, ${data.address}, ${data.constituency_id}) RETURNING *
    // `;
    // return result[0]?? null;
    const result = await prisma.user.create({
        data: {
            password: data.password,
            national_id: data.national_id,
            title: data.title,
            first_name: data.first_name,
            last_name: data.last_name,
            address: data.address,
            constituency_id: data.constituency_id
        }
    });
    return result;
};

export const getDistricts = async (
    page: number = 1,
    pageSize: number = 10,
    search?: string
): Promise<any> => {
    const skip = (page - 1) * pageSize;

    try {
        let query = `SELECT * FROM "Constituency" ORDER BY "province" ASC, "district_number" ASC LIMIT ${pageSize} OFFSET ${skip}`;
        let countQuery = `SELECT COUNT(*) as count FROM "Constituency"`;
        
        if (search) {
            const searchParam = `%${search}%`;
            const whereClause = `WHERE "province" ILIKE '${searchParam}' OR CAST("district_number" AS TEXT) LIKE '${search}%'`;
            query = `SELECT * FROM "Constituency" ${whereClause} ORDER BY "province" ASC, "district_number" ASC LIMIT ${pageSize} OFFSET ${skip}`;
            countQuery = `SELECT COUNT(*) as count FROM "Constituency" ${whereClause}`;
        }
        
        const items = await prisma.$queryRawUnsafe<any[]>(query);
        const countResult = await prisma.$queryRawUnsafe<any[]>(countQuery);
        
        const total = Number(countResult[0]?.count) || 0;

        return {
            items: (items || []).map((item: any) => ({
                id: item.id,
                province: item.province,
                district_number: item.district_number,
                is_closed: item.is_closed,
                created_at: item.created_at,
                total_voters: undefined,
                total_votes_cast: 0,
            })),
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    } catch (error) {
        console.error('[getDistricts] SQL ERROR:', error);
        throw error;
    }
};

export const getDistrictById = async (id: number): Promise<any> => {
    const result = await prisma.constituency.findUnique({
        where: { id },
        include: {
            Candidate: {
                include: {
                    Party: {
                        select: { name: true, logo_url: true },
                    },
                },
            },
        },
    });

    if (!result) return null;

    return {
        id: result.id,
        province: result.province,
        district_number: result.district_number,
        is_closed: result.is_closed,
        created_at: result.created_at,
        total_votes_cast: 0,
        candidates: (result as any).Candidate.map((c: any) => ({
            id: c.id,
            name: `${c.first_name} ${c.last_name}`,
            number: c.number,
            party_name: c.Party.name,
            party_logo_url: c.Party.logo_url,
            vote_count: 0,
        })),
    };
};

export const getAllUsers = async (
    page: number = 1,
    pageSize: number = 10,
    role?: string,
    search?: string
): Promise<any> => {
    const skip = (page - 1) * pageSize;
    
    try {
        // If role is EC, query from ECStaff table directly
        if (role === 'EC') {
            const ecStaff = await prisma.eCStaff.findMany({
                skip,
                take: pageSize,
                orderBy: {
                    id: 'desc',
                },
            });

            const ecStaffCount = await prisma.eCStaff.count();

            const users = ecStaff.map((staff: any) => ({
                id: staff.id,
                nationalId: staff.national_id,
                title: staff.title,
                firstName: staff.first_name,
                lastName: staff.last_name,
                address: '', // ECStaff doesn't have address in schema
                role: 'EC',
                constituency: null, // TODO: get from constituency_id if available
                lastLogin: null,
                createdAt: staff.id, // Use id as created_at substitute
            }));

            return {
                items: users,
                total: ecStaffCount,
                page,
                pageSize,
                totalPages: Math.ceil(ecStaffCount / pageSize),
            };
        }

        // If role is ADMIN, query from Admin table directly
        if (role === 'ADMIN') {
            const admins = await prisma.admin.findMany({
                skip,
                take: pageSize,
                orderBy: {
                    created_at: 'desc',
                },
            });

            const adminCount = await prisma.admin.count();

            const users = admins.map((admin: any) => ({
                id: admin.id,
                nationalId: admin.username,
                title: '',
                firstName: admin.username,
                lastName: '',
                address: '',
                role: 'ADMIN',
                constituency: null,
                lastLogin: null,
                createdAt: admin.created_at,
            }));

            return {
                items: users,
                total: adminCount,
                page,
                pageSize,
                totalPages: Math.ceil(adminCount / pageSize),
            };
        }

        // For VOTER role or no role filter, get from User table
        const voters = await prisma.user.findMany({
            skip,
            take: pageSize,
            include: {
                Constituency: true,
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        const voterCount = await prisma.user.count();

        // For each voter, check if they have an ECStaff record
        const usersWithRoles = await Promise.all(voters.map(async (user: any) => {
            const ecStaff = await prisma.eCStaff.findUnique({
                where: { national_id: user.national_id },
            });
            
            return {
                id: user.id,
                nationalId: user.national_id,
                title: user.title,
                firstName: user.first_name,
                lastName: user.last_name,
                address: user.address,
                role: ecStaff ? 'EC' : 'VOTER',
                constituency: user.Constituency?.province,
                lastLogin: null,
                createdAt: user.created_at,
            };
        }));

        // Filter by role if specified
        let filteredUsers = usersWithRoles;
        if (role && role !== 'EC' && role !== 'ADMIN') {
            filteredUsers = usersWithRoles.filter(user => user.role === role);
        }

        // For now, return voters. TODO: combine with EC and Admin if needed
        return {
            items: filteredUsers,
            total: voterCount,
            page,
            pageSize,
            totalPages: Math.ceil(voterCount / pageSize),
        };
    } catch (error) {
        console.error('[getAllUsers] Error:', error);
        throw error;
    }
};

export const getUserById = async (id: string): Promise<any> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                Constituency: true,
            },
        });

        if (!user) return null;

        return {
            id: user.id,
            nationalId: user.national_id,
            title: user.title,
            firstName: user.first_name,
            lastName: user.last_name,
            address: user.address,
            role: 'VOTER',
            constituency: user.Constituency?.province,
            lastLogin: null,
            createdAt: user.created_at,
        };
    } catch (error) {
        console.error('[getUserById] Error:', error);
        throw error;
    }
};

export const createUserWithRole = async (data: {
    nationalId: string;
    password: string;
    title: string;
    firstName: string;
    lastName: string;
    address: string;
    role: 'VOTER' | 'EC' | 'ADMIN';
    constituencyId?: number;
}): Promise<any> => {
    try {
        // Check if user with this national_id already exists
        const existingUser = await prisma.user.findUnique({
            where: { national_id: data.nationalId },
        });

        if (existingUser) {
            throw new Error('User with this national ID already exists');
        }

        // Prepare user data
        const userData: any = {
            national_id: data.nationalId,
            password: data.password,
            title: data.title,
            first_name: data.firstName,
            last_name: data.lastName,
            address: data.address,
        };

        // constituency_id is required in User table, so we need a default
        // For EC/ADMIN users, use first constituency as default
        // For VOTER users, use provided constituency or first one
        let constituencyIdToUse = data.constituencyId;
        
        if (!constituencyIdToUse) {
            // Get first constituency as default
            const firstConstituency = await prisma.constituency.findFirst({
                orderBy: { id: 'asc' },
            });
            
            if (!firstConstituency) {
                throw new Error('No constituencies found in database. Please create at least one constituency first.');
            }
            
            constituencyIdToUse = firstConstituency.id;
        }

        userData.constituency_id = constituencyIdToUse;

        // For VOTER role, create in User table
        if (data.role === 'VOTER') {
            const user = await prisma.user.create({
                data: userData,
                include: {
                    Constituency: true,
                },
            });

            return {
                id: user.id,
                nationalId: user.national_id,
                title: user.title,
                firstName: user.first_name,
                lastName: user.last_name,
                address: user.address,
                role: 'VOTER',
                constituency: (user as any).Constituency?.province,
                lastLogin: null,
                createdAt: user.created_at,
            };
        }

        // For EC or ADMIN roles, create in User table first, then create role record
        const user = await prisma.user.create({
            data: userData,
        });

        if (data.role === 'EC') {
            // Get first admin for association
            const admin = await prisma.admin.findFirst({
                where: { id: 1 },
            });

            if (!admin) {
                throw new Error('No admin found to associate with EC staff');
            }

            const ecStaffData: any = {
                admin_id: admin.id,
                national_id: data.nationalId,
                password: data.password,
                title: data.title,
                first_name: data.firstName,
                last_name: data.lastName,
                status: 'ACTIVE',
                constituency_id: data.constituencyId || constituencyIdToUse,
            };

            await prisma.eCStaff.create({
                data: ecStaffData,
            });
        } else if (data.role === 'ADMIN') {
            // For ADMIN, also create in Admin table with username
            await prisma.admin.create({
                data: {
                    username: data.nationalId,
                    password: data.password,
                },
            });
        }

        let constituency = null;
        if (constituencyIdToUse) {
            constituency = await prisma.constituency.findUnique({
                where: { id: constituencyIdToUse },
            });
        }

        return {
            id: user.id,
            nationalId: user.national_id,
            title: user.title,
            firstName: user.first_name,
            lastName: user.last_name,
            address: user.address,
            role: data.role,
            constituency: constituency?.province,
            lastLogin: null,
            createdAt: user.created_at,
        };
    } catch (error) {
        console.error('[createUserWithRole] Error:', error);
        throw error;
    }
};

export const updateUserDetails = async (
    userId: string,
    data: {
        firstName?: string;
        lastName?: string;
        address?: string;
    }
): Promise<any> => {
    try {
        // Update User table
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                first_name: data.firstName,
                last_name: data.lastName,
                address: data.address,
            },
            include: { Constituency: true },
        });

        // Check if this user is also an ECStaff
        const ecStaff = await prisma.eCStaff.findUnique({
            where: { national_id: user.national_id },
        });

        // If ECStaff exists, update it too
        if (ecStaff) {
            await prisma.eCStaff.update({
                where: { national_id: user.national_id },
                data: {
                    first_name: data.firstName,
                    last_name: data.lastName,
                },
            });
        }

        return {
            id: user.id,
            nationalId: user.national_id,
            title: user.title,
            firstName: user.first_name,
            lastName: user.last_name,
            address: user.address,
            role: ecStaff ? 'EC' : 'VOTER',
            constituency: (user as any).Constituency?.province,
            lastLogin: null,
            createdAt: user.created_at,
        };
    } catch (error) {
        console.error('[updateUserDetails] Error:', error);
        throw error;
    }
};
