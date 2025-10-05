import React, { useState } from 'react';
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from 'react-native';
import Video from 'react-native-video';
import { WebView } from 'react-native-webview';

const VideoPlayer = ({ 
  videoUrl, 
  fallbackVideoUrl,
  style = { height: 250 }, 
  showControls = true,
  autoPlay = false,
  onLoad,
  onError,
  onLoadStart
}) => {
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [videoPaused, setVideoPaused] = useState(!autoPlay);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(videoUrl);

  // Check if the URL is a YouTube URL
  const isYouTubeUrl = (url) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Convert YouTube URL to proper format
  const getYouTubeEmbedUrl = (url) => {
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // Extract video ID from various YouTube URL formats
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    }
    
    if (!videoId) {
      console.warn('Could not extract video ID from URL:', url);
      return url; // Return original URL as fallback
    }
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&controls=1&rel=0&modestbranding=1&showinfo=0`;
  };

  // Check if URL is a direct video file
  const isDirectVideoUrl = (url) => {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const handleVideoLoad = () => {
    setVideoLoading(false);
    setVideoError(null);
    if (onLoad) onLoad();
  };

  const handleVideoError = (error) => {
    console.error('Video error:', error);
    
    // Try fallback URL if available and we haven't tried it yet
    if (fallbackVideoUrl && currentVideoUrl === videoUrl) {
      console.log('Trying fallback video URL:', fallbackVideoUrl);
      setCurrentVideoUrl(fallbackVideoUrl);
      setVideoError(null);
      setVideoLoading(true);
      return;
    }
    
    setVideoLoading(false);
    setVideoError('Failed to load video. Please check your internet connection.');
    if (onError) onError(error);
  };

  const handleLoadStart = () => {
    setVideoLoading(true);
    if (onLoadStart) onLoadStart();
  };

  const toggleVideoPause = () => {
    setVideoPaused(!videoPaused);
  };

  const retryVideo = () => {
    setVideoError(null);
    setVideoLoading(true);
  };

  if (!videoUrl) {
    return (
      <View style={[style, { 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#f3f4f6' 
      }]}>
        <Text style={{ fontSize: 24, marginBottom: 8 }}>🎥</Text>
        <Text style={{ color: '#6b7280', textAlign: 'center' }}>
          Video URL not available
        </Text>
      </View>
    );
  }

  // For web platform, show a simple video link instead of trying to embed
  if (Platform.OS === 'web') {
    const embedUrl = isYouTubeUrl(currentVideoUrl) ? getYouTubeEmbedUrl(currentVideoUrl) : currentVideoUrl;
    
    return (
      <View style={[style, { 
        backgroundColor: '#000', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 20
      }]}>
        <Text style={{ fontSize: 24, marginBottom: 16, color: 'white' }}>🎥</Text>
        <Text style={{ 
          color: 'white', 
          textAlign: 'center', 
          fontSize: 16, 
          marginBottom: 20,
          lineHeight: 24
        }}>
          Video Player
        </Text>
        <Text style={{ 
          color: '#ccc', 
          textAlign: 'center', 
          fontSize: 14, 
          marginBottom: 20,
          lineHeight: 20
        }}>
          {isYouTubeUrl(currentVideoUrl) ? 
            'YouTube videos are not supported in web preview. Please open the video in a new tab.' :
            'Video playback is not available in web preview. Please open the video in a new tab.'
          }
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#2563eb',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
            marginBottom: 10
          }}
          onPress={() => {
            window.open(embedUrl, '_blank');
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
            Open Video
          </Text>
        </TouchableOpacity>
        {fallbackVideoUrl && (
          <TouchableOpacity
            style={{
              backgroundColor: '#6b7280',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 8
            }}
            onPress={() => {
              window.open(fallbackVideoUrl, '_blank');
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
              Try Alternative Video
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // For mobile platforms, use WebView for YouTube URLs or react-native-video for direct videos
  if (isYouTubeUrl(currentVideoUrl) && !isDirectVideoUrl(currentVideoUrl)) {
    const embedUrl = getYouTubeEmbedUrl(currentVideoUrl);
    
    return (
      <View style={[style, { backgroundColor: '#000' }]}>
        <WebView
          source={{ uri: embedUrl }}
          style={{ flex: 1 }}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState={true}
          onLoadStart={handleLoadStart}
          onLoad={handleVideoLoad}
          onError={handleVideoError}
          renderLoading={() => (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.7)'
            }}>
              <ActivityIndicator size="large" color="white" />
              <Text style={{ color: 'white', marginTop: 8, fontSize: 16 }}>Loading video...</Text>
            </View>
          )}
        />
        
        {/* Error Overlay for WebView */}
        {videoError && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 20
          }}>
            <Text style={{ fontSize: 24, marginBottom: 8 }}>⚠️</Text>
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, marginBottom: 16 }}>
              {videoError}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#2563eb',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8
              }}
              onPress={retryVideo}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Use react-native-video for direct video files (MP4, MOV, etc.) on mobile
  return (
    <View style={[style, { backgroundColor: '#000', position: 'relative' }]}>
      <Video
        source={{ uri: currentVideoUrl }}
        style={{ flex: 1 }}
        paused={videoPaused}
        resizeMode="contain"
        onLoad={handleVideoLoad}
        onError={handleVideoError}
        onLoadStart={handleLoadStart}
        controls={showControls}
        playInBackground={false}
        playWhenInactive={false}
      />
      
      {/* Loading Overlay */}
      {videoLoading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}>
          <ActivityIndicator size="large" color="white" />
          <Text style={{ color: 'white', marginTop: 8, fontSize: 16 }}>Loading video...</Text>
        </View>
      )}
      
      {/* Error Overlay */}
      {videoError && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 20
        }}>
          <Text style={{ fontSize: 24, marginBottom: 8 }}>⚠️</Text>
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, marginBottom: 16 }}>
            {videoError}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#2563eb',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8
            }}
            onPress={retryVideo}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Play/Pause Overlay Button */}
      {!videoLoading && !videoError && showControls && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent'
          }}
          onPress={toggleVideoPause}
          activeOpacity={0.7}
        >
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{ color: 'white', fontSize: 24 }}>
              {videoPaused ? '▶️' : '⏸️'}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoPlayer;