import { supabase } from '@/lib/supabase';
import type { Lecture, LectureResource } from '@/data/lectures';

// Extend the Lecture type to include database fields
export interface DatabaseLecture extends Omit<Lecture, 'resources'> {
  id: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  resources?: LectureResource[];
}

export interface DatabaseResource extends LectureResource {
  id: string;
  lecture_id: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  membership_status: 'active' | 'inactive' | 'expired';
  membership_expires_at?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  lecture_id: string;
  enrolled_at: string;
  completed_at?: string;
  lecture?: DatabaseLecture;
}

export const databaseService = {
  // Lectures
  async getLectures(): Promise<DatabaseLecture[]> {
    const { data, error } = await supabase
      .from('lectures')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching lectures:', error);
      throw new Error('Failed to fetch lectures');
    }
    
    return data || [];
  },

  async getLectureBySlug(slug: string): Promise<DatabaseLecture & { resources: DatabaseResource[] }> {
    const { data, error } = await supabase
      .from('lectures')
      .select(`
        *,
        resources (*)
      `)
      .eq('slug', slug)
      .single();
    
    if (error) {
      console.error('Error fetching lecture:', error);
      throw new Error('Lecture not found');
    }
    
    return data;
  },

  async createLecture(lecture: Partial<DatabaseLecture>) {
    const { data, error } = await supabase
      .from('lectures')
      .insert(lecture)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating lecture:', error);
      throw new Error('Failed to create lecture');
    }
    
    return data;
  },

  async updateLecture(id: string, updates: Partial<DatabaseLecture>) {
    const { data, error } = await supabase
      .from('lectures')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating lecture:', error);
      throw new Error('Failed to update lecture');
    }
    
    return data;
  },

  async deleteLecture(id: string) {
    const { error } = await supabase
      .from('lectures')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting lecture:', error);
      throw new Error('Failed to delete lecture');
    }
  },

  // Profiles
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching profile:', error);
      throw new Error('Failed to fetch profile');
    }
    
    return data;
  },

  async createProfile(profile: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating profile:', error);
      throw new Error('Failed to create profile');
    }
    
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
    
    return data;
  },

  // Enrollments
  async enrollInLecture(userId: string, lectureId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .insert({ user_id: userId, lecture_id: lectureId })
      .select()
      .single();
    
    if (error) {
      console.error('Error enrolling in lecture:', error);
      throw new Error('Failed to enroll in lecture');
    }
    
    return data;
  },

  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        lectures (*)
      `)
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching enrollments:', error);
      throw new Error('Failed to fetch enrollments');
    }
    
    return data || [];
  },

  async markLectureCompleted(userId: string, lectureId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .update({ completed_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('lecture_id', lectureId)
      .select()
      .single();
    
    if (error) {
      console.error('Error marking lecture completed:', error);
      throw new Error('Failed to mark lecture as completed');
    }
    
    return data;
  },

  // Resources
  async createResource(resource: Partial<DatabaseResource>) {
    const { data, error } = await supabase
      .from('resources')
      .insert(resource)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating resource:', error);
      throw new Error('Failed to create resource');
    }
    
    return data;
  },

  async updateResource(id: string, updates: Partial<DatabaseResource>) {
    const { data, error } = await supabase
      .from('resources')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating resource:', error);
      throw new Error('Failed to update resource');
    }
    
    return data;
  },

  async deleteResource(id: string) {
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting resource:', error);
      throw new Error('Failed to delete resource');
    }
  }
};
