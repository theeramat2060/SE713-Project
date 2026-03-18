import prisma from '../config/prisma';

export interface CreateECStaffInput {
  admin_id: number;
  national_id: string;
  password: string;
  title: string;
  first_name: string;
  last_name: string;
  email?: string;
  constituency_id: number;
}

export interface UpdateECStaffInput {
  national_id?: string;
  password?: string;
  title?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  constituency_id?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

class ECStaffRepository {
  async create(data: CreateECStaffInput) {
    return prisma.eCStaff.create({
      data: {
        admin_id: data.admin_id,
        national_id: data.national_id,
        password: data.password,
        title: data.title,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        constituency_id: data.constituency_id,
      },
    });
  }

  async findById(id: string) {
    return prisma.eCStaff.findUnique({
      where: { id },
    });
  }

  async findByNationalId(national_id: string) {
    return prisma.eCStaff.findUnique({
      where: { national_id },
    });
  }

  async findAll() {
    return prisma.eCStaff.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findByAdmin(admin_id: number) {
    return prisma.eCStaff.findMany({
      where: { admin_id },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByConstituency(constituency_id: number) {
    return prisma.eCStaff.findMany({
      where: { constituency_id },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByStatus(status: 'ACTIVE' | 'INACTIVE') {
    return prisma.eCStaff.findMany({
      where: { status },
      orderBy: { created_at: 'desc' },
    });
  }

  async update(id: string, data: UpdateECStaffInput) {
    return prisma.eCStaff.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.eCStaff.delete({
      where: { id },
    });
  }

  async deleteByAdmin(admin_id: number) {
    return prisma.eCStaff.deleteMany({
      where: { admin_id },
    });
  }

  async count() {
    return prisma.eCStaff.count();
  }

  async countByAdmin(admin_id: number) {
    return prisma.eCStaff.count({
      where: { admin_id },
    });
  }
}

export default new ECStaffRepository();
