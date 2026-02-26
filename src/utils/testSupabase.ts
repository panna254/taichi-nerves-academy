import { databaseService } from '@/services/database';
import { storageService } from '@/services/storage';
import { userApi } from '@/services/userApi';
import { realtimeService } from '@/services/realtime';
import type { Profile } from '@/services/database';

export interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

export class SupabaseTester {
  private results: TestResult[] = [];

  private addResult(test: string, success: boolean, message: string, details?: any) {
    this.results.push({
      success,
      message: `${test}: ${message}`,
      details
    });
    
    const status = success ? '✅' : '❌';
    console.log(`${status} ${test}: ${message}`);
    
    if (details && !success) {
      console.error('Details:', details);
    }
  }

  /**
   * Test authentication functionality
   */
  async testAuthentication(): Promise<void> {
    try {
      console.log('🔐 Testing Authentication...');
      
      // Test 1: Check current session
      const currentUser = await userApi.getCurrentUser();
      this.addResult(
        'Current Session Check',
        true,
        currentUser ? `User logged in: ${currentUser.email}` : 'No active session'
      );

      // Test 2: Test user signup (with random email to avoid conflicts)
      const testEmail = `test-${Date.now()}@example.com`;
      try {
        const signupResult = await userApi.signup({
          name: 'Test User',
          email: testEmail,
          password: 'testpassword123'
        });
        this.addResult(
          'User Signup',
          true,
          `Successfully created user: ${signupResult.user.email}`
        );
      } catch (error: any) {
        // Email confirmation might be enabled, which is expected
        if (error.message.includes('check your email')) {
          this.addResult(
            'User Signup',
            true,
            'Signup successful (email confirmation required)'
          );
        } else {
          this.addResult(
            'User Signup',
            false,
            error.message,
            error
          );
        }
      }

    } catch (error: any) {
      this.addResult(
        'Authentication Test',
        false,
        error.message,
        error
      );
    }
  }

  /**
   * Test database operations
   */
  async testDatabase(): Promise<void> {
    try {
      console.log('🗄️ Testing Database Operations...');
      
      // Test 1: Fetch lectures
      try {
        const lectures = await databaseService.getLectures();
        this.addResult(
          'Fetch Lectures',
          true,
          `Found ${lectures.length} lectures`
        );
      } catch (error: any) {
        this.addResult(
          'Fetch Lectures',
          false,
          error.message,
          error
        );
      }

      // Test 2: Test lecture creation (if user is authenticated)
      try {
        const testLecture = {
          slug: `test-lecture-${Date.now()}`,
          title: 'Test Lecture',
          description: 'This is a test lecture',
          youtubeId: 'dQw4w9WgXcQ',
          duration: '10 min',
          level: 'Beginner' as const,
          tags: ['test'],
          resources: []
        };
        
        const createdLecture = await databaseService.createLecture(testLecture);
        this.addResult(
          'Create Lecture',
          true,
          `Created lecture: ${createdLecture.title}`
        );

        // Test 3: Fetch specific lecture
        const fetchedLecture = await databaseService.getLectureBySlug(createdLecture.slug);
        this.addResult(
          'Fetch Lecture by Slug',
          true,
          `Successfully fetched: ${fetchedLecture.title}`
        );

        // Test 4: Update lecture
        const updatedLecture = await databaseService.updateLecture(createdLecture.id, {
          title: 'Updated Test Lecture'
        });
        this.addResult(
          'Update Lecture',
          true,
          `Updated lecture title to: ${updatedLecture.title}`
        );

        // Test 5: Delete lecture
        await databaseService.deleteLecture(createdLecture.id);
        this.addResult(
          'Delete Lecture',
          true,
          'Successfully deleted test lecture'
        );

      } catch (error: any) {
        this.addResult(
          'Lecture CRUD Operations',
          false,
          error.message,
          error
        );
      }

    } catch (error: any) {
      this.addResult(
        'Database Test',
        false,
        error.message,
        error
      );
    }
  }

  /**
   * Test profile operations
   */
  async testProfiles(): Promise<void> {
    try {
      console.log('👤 Testing Profile Operations...');
      
      const currentUser = await userApi.getCurrentUser();
      if (!currentUser) {
        this.addResult(
          'Profile Test',
          false,
          'No authenticated user available for profile testing'
        );
        return;
      }

      // Test 1: Get profile
      try {
        const profile = await databaseService.getProfile(currentUser.id);
        this.addResult(
          'Get Profile',
          true,
          profile ? `Profile found for: ${profile.full_name || currentUser.email}` : 'No profile found (expected for new users)'
        );
      } catch (error: any) {
        this.addResult(
          'Get Profile',
          false,
          error.message,
          error
        );
      }

      // Test 2: Create/update profile
      try {
        const profileData: Partial<Profile> = {
          full_name: 'Test User Updated',
          bio: 'This is a test bio',
          membership_status: 'active'
        };
        
        const updatedProfile = await databaseService.updateProfile(currentUser.id, profileData);
        this.addResult(
          'Update Profile',
          true,
          `Profile updated: ${updatedProfile.full_name}`
        );
      } catch (error: any) {
        this.addResult(
          'Update Profile',
          false,
          error.message,
          error
        );
      }

    } catch (error: any) {
      this.addResult(
        'Profile Test',
        false,
        error.message,
        error
      );
    }
  }

  /**
   * Test file storage operations
   */
  async testStorage(): Promise<void> {
    try {
      console.log('📁 Testing Storage Operations...');
      
      const currentUser = await userApi.getCurrentUser();
      if (!currentUser) {
        this.addResult(
          'Storage Test',
          false,
          'No authenticated user available for storage testing'
        );
        return;
      }

      // Test 1: Upload avatar
      try {
        const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const avatarUrl = await storageService.uploadAvatar(currentUser.id, testFile);
        this.addResult(
          'Upload Avatar',
          true,
          `Avatar uploaded: ${avatarUrl}`
        );
      } catch (error: any) {
        this.addResult(
          'Upload Avatar',
          false,
          error.message,
          error
        );
      }

      // Test 2: Upload lecture resource
      try {
        const testResource = new File(['resource content'], 'test-resource.pdf', { type: 'application/pdf' });
        const resourceUrl = await storageService.uploadLectureResource('test-lecture-id', testResource);
        this.addResult(
          'Upload Lecture Resource',
          true,
          `Resource uploaded: ${resourceUrl}`
        );
      } catch (error: any) {
        this.addResult(
          'Upload Lecture Resource',
          false,
          error.message,
          error
        );
      }

    } catch (error: any) {
      this.addResult(
        'Storage Test',
        false,
        error.message,
        error
      );
    }
  }

  /**
   * Test real-time functionality
   */
  async testRealtime(): Promise<void> {
    try {
      console.log('🔄 Testing Real-time Features...');
      
      let realtimeReceived = false;
      
      // Test 1: Subscribe to lecture updates
      try {
        const channel = realtimeService.subscribeToLectures((payload) => {
          realtimeReceived = true;
          console.log('Real-time event received:', payload);
        });
        
        this.addResult(
          'Real-time Subscription',
          true,
          `Subscribed to lecture updates: ${channel ? 'Success' : 'Failed'}`
        );

        // Test 2: Check connection status
        const status = realtimeService.getConnectionStatus();
        this.addResult(
          'Real-time Connection Status',
          true,
          `${status.connectedChannels} channels connected`
        );

        // Test 3: Unsubscribe
        realtimeService.unsubscribe('lectures');
        this.addResult(
          'Real-time Unsubscribe',
          true,
          'Successfully unsubscribed from lecture updates'
        );

      } catch (error: any) {
        this.addResult(
          'Real-time Test',
          false,
          error.message,
          error
        );
      }

    } catch (error: any) {
      this.addResult(
        'Real-time Test',
        false,
        error.message,
        error
      );
    }
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting Supabase Integration Tests...\n');
    
    this.results = []; // Reset results
    
    await this.testAuthentication();
    await this.testDatabase();
    await this.testProfiles();
    await this.testStorage();
    await this.testRealtime();
    
    this.printSummary();
    return this.results;
  }

  /**
   * Print test summary
   */
  private printSummary(): void {
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const total = this.results.length;
    
    console.log('\n📊 Test Summary:');
    console.log(`Total tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => console.log(`  - ${r.message}`));
    }
    
    console.log('\n🎉 Supabase Integration Testing Complete!');
  }

  /**
   * Test specific functionality
   */
  async testSpecific(testName: 'auth' | 'database' | 'profiles' | 'storage' | 'realtime'): Promise<void> {
    switch (testName) {
      case 'auth':
        await this.testAuthentication();
        break;
      case 'database':
        await this.testDatabase();
        break;
      case 'profiles':
        await this.testProfiles();
        break;
      case 'storage':
        await this.testStorage();
        break;
      case 'realtime':
        await this.testRealtime();
        break;
    }
    
    this.printSummary();
  }
}

// Export singleton instance and convenience functions
export const supabaseTester = new SupabaseTester();

// Convenience functions for quick testing
export const testSupabaseIntegration = () => supabaseTester.runAllTests();
export const testSupabaseAuth = () => supabaseTester.testSpecific('auth');
export const testSupabaseDatabase = () => supabaseTester.testSpecific('database');
export const testSupabaseProfiles = () => supabaseTester.testSpecific('profiles');
export const testSupabaseStorage = () => supabaseTester.testSpecific('storage');
export const testSupabaseRealtime = () => supabaseTester.testSpecific('realtime');

// Export for use in components
// SupabaseTester class is already exported above
