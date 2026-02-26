import { supabase } from '@/lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface RealtimeEvent<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  commit_timestamp: string;
  old?: T;
  new?: T;
}

export type RealtimeCallback<T = any> = (payload: RealtimePostgresChangesPayload<T>) => void;

export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private subscriptions: Map<string, Set<RealtimeCallback>> = new Map();

  /**
   * Subscribe to lecture updates
   * @param callback Callback function for lecture changes
   * @returns Channel instance
   */
  subscribeToLectures<T = any>(callback: RealtimeCallback<T>): RealtimeChannel {
    const channelName = 'lectures';
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lectures'
        },
        callback
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to lecture updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Failed to subscribe to lecture updates');
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to profile updates for a specific user
   * @param userId User ID to monitor
   * @param callback Callback function for profile changes
   * @returns Channel instance
   */
  subscribeToProfile<T = any>(userId: string, callback: RealtimeCallback<T>): RealtimeChannel {
    const channelName = `profile-${userId}`;
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        callback
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to profile updates for user ${userId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Failed to subscribe to profile updates for user ${userId}`);
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to enrollment updates for a specific user
   * @param userId User ID to monitor
   * @param callback Callback function for enrollment changes
   * @returns Channel instance
   */
  subscribeToEnrollments<T = any>(userId: string, callback: RealtimeCallback<T>): RealtimeChannel {
    const channelName = `enrollments-${userId}`;
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enrollments',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to enrollment updates for user ${userId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Failed to subscribe to enrollment updates for user ${userId}`);
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to resource updates
   * @param callback Callback function for resource changes
   * @returns Channel instance
   */
  subscribeToResources<T = any>(callback: RealtimeCallback<T>): RealtimeChannel {
    const channelName = 'resources';
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resources'
        },
        callback
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to resource updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Failed to subscribe to resource updates');
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to multiple tables with a single channel
   * @param subscriptions Array of table subscriptions
   * @returns Channel instance
   */
  subscribeToMultiple(subscriptions: Array<{
    table: string;
    schema?: string;
    filter?: string;
    callback: RealtimeCallback;
  }>): RealtimeChannel {
    const channelName = `multi-${Date.now()}`;
    
    const channel = supabase.channel(channelName);

    subscriptions.forEach(sub => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: sub.schema || 'public',
          table: sub.table,
          filter: sub.filter
        },
        sub.callback
      );
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Subscribed to multiple tables');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Failed to subscribe to multiple tables');
      }
    });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Unsubscribe from a specific channel
   * @param channelName Channel name to unsubscribe from
   */
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      console.log(`🔌 Unsubscribed from ${channelName}`);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel, channelName) => {
      supabase.removeChannel(channel);
      console.log(`🔌 Unsubscribed from ${channelName}`);
    });
    this.channels.clear();
    this.subscriptions.clear();
  }

  /**
   * Get connection status
   * @returns Connection status object
   */
  getConnectionStatus() {
    return {
      connectedChannels: this.channels.size,
      channelNames: Array.from(this.channels.keys()),
      isRealtimeEnabled: supabase.realtime.isConnected()
    };
  }

  /**
   * Broadcast a message to all connected clients
   * @param event Event name
   * @param payload Event payload
   */
  async broadcast(event: string, payload: any): Promise<void> {
    try {
      const channel = supabase.channel('global-broadcast');
      await channel.send({
        type: 'broadcast',
        event,
        payload
      });
    } catch (error) {
      console.error('Error broadcasting message:', error);
      throw new Error('Failed to broadcast message');
    }
  }

  /**
   * Listen for broadcast messages
   * @param event Event name to listen for
   * @param callback Callback function
   */
  listenForBroadcasts(event: string, callback: (payload: any) => void): RealtimeChannel {
    const channelName = `broadcast-${event}`;
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event }, callback)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Listening for broadcast events: ${event}`);
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();

// Export utility functions for common use cases
export const useRealtimeLectures = (callback: RealtimeCallback) => {
  return realtimeService.subscribeToLectures(callback);
};

export const useRealtimeProfile = (userId: string, callback: RealtimeCallback) => {
  return realtimeService.subscribeToProfile(userId, callback);
};

export const useRealtimeEnrollments = (userId: string, callback: RealtimeCallback) => {
  return realtimeService.subscribeToEnrollments(userId, callback);
};
