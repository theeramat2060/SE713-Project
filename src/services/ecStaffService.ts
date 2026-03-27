import bcrypt from 'bcryptjs';
import ecStaffRepository, { CreateECStaffInput, UpdateECStaffInput } from '../repositories/ecStaffRepository';

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    message: string;
  };
}

class ECStaffService {
  async createECStaff(adminId: number, input: Omit<CreateECStaffInput, 'admin_id' | 'password'> & { password: string }): Promise<ServiceResponse<any>> {
    try {
      // Check if national_id already exists
      const existing = await ecStaffRepository.findByNationalId(input.national_id);
      if (existing) {
        return {
          success: false,
          error: { code: 400, message: 'EC Staff with this national ID already exists' },
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      const ecStaff = await ecStaffRepository.create({
        ...input,
        password: hashedPassword,
        admin_id: adminId,
      });

      return {
        success: true,
        data: {
          id: ecStaff.id,
          national_id: ecStaff.national_id,
          title: ecStaff.title,
          first_name: ecStaff.first_name,
          last_name: ecStaff.last_name,
          constituency_id: ecStaff.constituency_id,
          status: ecStaff.status,
          email: ecStaff.email,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 500, message: error.message || 'Failed to create EC Staff' },
      };
    }
  }

  async updateECStaff(id: string, adminId: number, input: UpdateECStaffInput): Promise<ServiceResponse<any>> {
    try {
      // Check if EC Staff exists and belongs to this admin
      const ecStaff = await ecStaffRepository.findById(id);
      if (!ecStaff) {
        return {
          success: false,
          error: { code: 404, message: 'EC Staff not found' },
        };
      }

      if (ecStaff.admin_id !== adminId) {
        return {
          success: false,
          error: { code: 403, message: 'Unauthorized to update this EC Staff' },
        };
      }

      // Check if national_id is being changed and already exists
      if (input.national_id && input.national_id !== ecStaff.national_id) {
        const existing = await ecStaffRepository.findByNationalId(input.national_id);
        if (existing) {
          return {
            success: false,
            error: { code: 400, message: 'National ID already exists' },
          };
        }
      }

      // Hash password if provided
      const updateData: UpdateECStaffInput = { ...input };
      if (input.password) {
        updateData.password = await bcrypt.hash(input.password, 10);
      }

      const updated = await ecStaffRepository.update(id, updateData);

      return {
        success: true,
        data: {
          id: updated.id,
          national_id: updated.national_id,
          title: updated.title,
          first_name: updated.first_name,
          last_name: updated.last_name,
          constituency_id: updated.constituency_id,
          status: updated.status,
          email: updated.email,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 500, message: error.message || 'Failed to update EC Staff' },
      };
    }
  }

  async deleteECStaff(id: string, adminId: number): Promise<ServiceResponse<void>> {
    try {
      // Check if EC Staff exists and belongs to this admin
      const ecStaff = await ecStaffRepository.findById(id);
      if (!ecStaff) {
        return {
          success: false,
          error: { code: 404, message: 'EC Staff not found' },
        };
      }

      if (ecStaff.admin_id !== adminId) {
        return {
          success: false,
          error: { code: 403, message: 'Unauthorized to delete this EC Staff' },
        };
      }

      await ecStaffRepository.delete(id);

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 500, message: error.message || 'Failed to delete EC Staff' },
      };
    }
  }

  async getECStaffById(id: string): Promise<ServiceResponse<any>> {
    try {
      const ecStaff = await ecStaffRepository.findById(id);
      if (!ecStaff) {
        return {
          success: false,
          error: { code: 404, message: 'EC Staff not found' },
        };
      }

      return {
        success: true,
        data: {
          id: ecStaff.id,
          national_id: ecStaff.national_id,
          title: ecStaff.title,
          first_name: ecStaff.first_name,
          last_name: ecStaff.last_name,
          constituency_id: ecStaff.constituency_id,
          status: ecStaff.status,
          email: ecStaff.email,
          created_at: ecStaff.created_at,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 500, message: error.message || 'Failed to fetch EC Staff' },
      };
    }
  }

  async getAllECStaff(): Promise<ServiceResponse<any[]>> {
    try {
      const ecStaff = await ecStaffRepository.findAll();
      return {
        success: true,
        data: ecStaff.map((e: any) => ({
          id: e.id,
          national_id: e.national_id,
          title: e.title,
          first_name: e.first_name,
          last_name: e.last_name,
          constituency_id: e.constituency_id,
          status: e.status,
          email: e.email,
          admin_id: e.admin_id,
          created_at: e.created_at,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 500, message: error.message || 'Failed to fetch EC Staff' },
      };
    }
  }

  async getECStaffByAdmin(admin_id: number): Promise<ServiceResponse<any[]>> {
    try {
      const ecStaff = await ecStaffRepository.findByAdmin(admin_id);
      return {
        success: true,
        data: ecStaff.map((e: any) => ({
          id: e.id,
          national_id: e.national_id,
          title: e.title,
          first_name: e.first_name,
          last_name: e.last_name,
          constituency_id: e.constituency_id,
          status: e.status,
          email: e.email,
          created_at: e.created_at,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 500, message: error.message || 'Failed to fetch EC Staff' },
      };
    }
  }

  async getECStaffByConstituency(constituency_id: number): Promise<ServiceResponse<any[]>> {
    try {
      const ecStaff = await ecStaffRepository.findByConstituency(constituency_id);
      return {
        success: true,
        data: ecStaff.map((e: any) => ({
          id: e.id,
          national_id: e.national_id,
          title: e.title,
          first_name: e.first_name,
          last_name: e.last_name,
          status: e.status,
          email: e.email,
          created_at: e.created_at,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 500, message: error.message || 'Failed to fetch EC Staff by constituency' },
      };
    }
  }

  async verifyPassword(national_id: string, password: string): Promise<ServiceResponse<any>> {
    try {
      const ecStaff = await ecStaffRepository.findByNationalId(national_id);
      if (!ecStaff) {
        return {
          success: false,
          error: { code: 401, message: 'Invalid credentials' },
        };
      }

      if (ecStaff.status !== 'ACTIVE') {
        return {
          success: false,
          error: { code: 403, message: 'EC Staff account is inactive' },
        };
      }

      const passwordMatch = await bcrypt.compare(password, ecStaff.password);
      if (!passwordMatch) {
        return {
          success: false,
          error: { code: 401, message: 'Invalid credentials' },
        };
      }

      return {
        success: true,
        data: ecStaff,
      };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 500, message: error.message || 'Password verification failed' },
      };
    }
  }
}

export default new ECStaffService();
