import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = () => {
  const [refreshing, setRefreshing] = React.useState(false);

  // Placeholder data - will be replaced with actual video data from API
  const videos = [
    {
      id: '1',
      title: 'Welcome to YT-CC',
      thumbnail: 'https://via.placeholder.com/320x180',
      channel: 'YT-CC Official',
      views: '1.2K views',
      timestamp: '2 days ago',
    },
    {
      id: '2',
      title: 'Getting Started Tutorial',
      thumbnail: 'https://via.placeholder.com/320x180',
      channel: 'YT-CC Tutorials',
      views: '850 views',
      timestamp: '1 week ago',
    },
    {
      id: '3',
      title: 'Advanced Features Overview',
      thumbnail: 'https://via.placeholder.com/320x180',
      channel: 'YT-CC Pro',
      views: '2.5K views',
      timestamp: '3 days ago',
    },
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Fetch videos here
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const renderVideo = ({ item }) => (
    <TouchableOpacity style={styles.videoCard}>
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.videoInfo}>
        <View style={styles.channelAvatar}>
          <Ionicons name="person-circle" size={40} color="#ccc" />
        </View>
        <View style={styles.videoDetails}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.channelName}>{item.channel}</Text>
          <Text style={styles.videoMeta}>
            {item.views} • {item.timestamp}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF0000']}
            tintColor="#FF0000"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="videocam-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No videos yet</Text>
            <Text style={styles.emptySubtext}>
              Videos will appear here once uploaded
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingBottom: 20,
  },
  videoCard: {
    marginBottom: 15,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  videoInfo: {
    flexDirection: 'row',
    padding: 12,
  },
  channelAvatar: {
    marginRight: 12,
  },
  videoDetails: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  channelName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  videoMeta: {
    fontSize: 12,
    color: '#999',
  },
  moreButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});

export default HomeScreen;
