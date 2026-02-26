import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import { databaseService, type DatabaseLecture, type Profile, type Enrollment } from '@/services/database';
import { useAuth } from './useAuth';

// Query keys for consistency
export const queryKeys = {
  lectures: ['lectures'] as const,
  lecture: (slug: string) => ['lecture', slug] as const,
  profile: (userId: string) => ['profile', userId] as const,
  enrollments: (userId: string) => ['enrollments', userId] as const,
  resources: (lectureId: string) => ['resources', lectureId] as const,
};

// Lectures hooks
export const useLectures = () => {
  return useQuery({
    queryKey: queryKeys.lectures,
    queryFn: () => databaseService.getLectures(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useLecture = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.lecture(slug),
    queryFn: () => databaseService.getLectureBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

export const useCreateLecture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (lecture: Partial<DatabaseLecture>) => 
      databaseService.createLecture(lecture),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lectures });
      queryClient.setQueryData(queryKeys.lecture(data.slug), data);
    },
    onError: (error) => {
      console.error('Failed to create lecture:', error);
    },
  });
};

export const useUpdateLecture = (slug: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Partial<DatabaseLecture>) => 
      databaseService.updateLecture(updates.id!, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lectures });
      queryClient.setQueryData(queryKeys.lecture(slug), data);
    },
    onError: (error) => {
      console.error('Failed to update lecture:', error);
    },
  });
};

export const useDeleteLecture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (lectureId: string) => 
      databaseService.deleteLecture(lectureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lectures });
    },
    onError: (error) => {
      console.error('Failed to delete lecture:', error);
    },
  });
};

// Profile hooks
export const useProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.profile(user?.id || ''),
    queryFn: () => databaseService.getProfile(user!.id),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

export const useCreateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (profile: Partial<Profile>) => 
      databaseService.createProfile(profile),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profile(user!.id), data);
    },
    onError: (error) => {
      console.error('Failed to create profile:', error);
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (updates: Partial<Profile>) => 
      databaseService.updateProfile(user!.id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profile(user!.id), data);
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    },
  });
};

// Enrollment hooks
export const useEnrollments = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.enrollments(user?.id || ''),
    queryFn: () => databaseService.getUserEnrollments(user!.id),
    enabled: !!user?.id,
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });
};

export const useEnrollInLecture = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (lectureId: string) => 
      databaseService.enrollInLecture(user!.id, lectureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments(user!.id) });
    },
    onError: (error) => {
      console.error('Failed to enroll in lecture:', error);
    },
  });
};

export const useMarkLectureCompleted = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (lectureId: string) => 
      databaseService.markLectureCompleted(user!.id, lectureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments(user!.id) });
    },
    onError: (error) => {
      console.error('Failed to mark lecture as completed:', error);
    },
  });
};

// Utility hooks
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateLectures: () => queryClient.invalidateQueries({ queryKey: queryKeys.lectures }),
    invalidateProfile: (userId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) }),
    invalidateEnrollments: (userId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.enrollments(userId) }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
};

export const usePrefetchQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    prefetchLecture: (slug: string) => 
      queryClient.prefetchQuery({
        queryKey: queryKeys.lecture(slug),
        queryFn: () => databaseService.getLectureBySlug(slug),
      }),
    prefetchProfile: (userId: string) => 
      queryClient.prefetchQuery({
        queryKey: queryKeys.profile(userId),
        queryFn: () => databaseService.getProfile(userId),
      }),
  };
};

// Custom hook for optimistic updates
export const useOptimisticLectureUpdate = (slug: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Partial<DatabaseLecture>) => 
      databaseService.updateLecture(updates.id!, updates),
    onMutate: async (updates) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.lecture(slug) });
      
      // Snapshot the previous value
      const previousLecture = queryClient.getQueryData(queryKeys.lecture(slug));
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.lecture(slug), (old: any) => 
        old ? { ...old, ...updates } : updates
      );
      
      // Return a context object with the snapshotted value
      return { previousLecture };
    },
    onError: (err, newLecture, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        queryKeys.lecture(slug), 
        (context as any)?.previousLecture
      );
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.lecture(slug) });
    },
  });
};
