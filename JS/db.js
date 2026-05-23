/* ============================================
   AURA — Database API
   ============================================ */

const DB = (() => {
  function sb() { return getSupabase(); }

  /* ========== PROFILES ========== */

  async function getProfile(userId) {
    const { data, error } = await sb()
      .from('profiles')
      .select(`
        *,
        followers_count:follows!follows_following_id_fkey(count),
        following_count:follows!follows_follower_id_fkey(count),
        posts_count:posts(count)
      `)
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  }

  async function getProfileByUsername(username) {
    const { data, error } = await sb()
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    if (error) throw error;
    return data;
  }

  async function updateProfile(userId, updates) {
    const { data, error } = await sb()
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function uploadAvatar(userId, file) {
    const ext  = file.name.split('.').pop();
    const path = `avatars/${userId}.${ext}`;
    const { error: uploadError } = await sb()
      .storage.from('media').upload(path, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = sb().storage.from('media').getPublicUrl(path);
    return data.publicUrl;
  }

  /* ========== POSTS ========== */

  async function getFeedPosts(userId, { limit = 20, offset = 0 } = {}) {
    // Étape 1 : récupérer les posts avec profil + compteurs
    const { data: posts, error } = await sb()
      .from('posts')
      .select(`
        *,
        profile:profiles!posts_user_id_fkey(id,username,display_name,avatar_url,current_mood,aura_color),
        likes_count:likes(count),
        comments_count:comments(count)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    if (!posts || posts.length === 0) return [];

    // Étape 2 : vérifier les likes de l'utilisateur connecté séparément
    const postIds = posts.map(p => p.id);
    const { data: userLikes } = await sb()
      .from('likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds);

    const likedSet = new Set((userLikes || []).map(l => l.post_id));

    // Étape 3 : enrichir chaque post avec is_liked
    return posts.map(post => ({
      ...post,
      is_liked: likedSet.has(post.id),
    }));
  }

  async function getPostsByUser(userId, { limit = 20, offset = 0 } = {}) {
    const { data, error } = await sb()
      .from('posts')
      .select(`
        *,
        likes_count:likes(count),
        comments_count:comments(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data || [];
  }

  async function createPost(post) {
    const { data, error } = await sb()
      .from('posts')
      .insert(post)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function deletePost(postId, userId) {
    const { error } = await sb()
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);
    if (error) throw error;
  }

  /* ========== LIKES ========== */

  async function likePost(postId, userId) {
    const { data, error } = await sb()
      .from('likes')
      .upsert({ post_id: postId, user_id: userId }, { onConflict: 'post_id,user_id' })
      .select();
    if (error) throw error;
    return data;
  }

  async function unlikePost(postId, userId) {
    const { error } = await sb()
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) throw error;
  }

  async function isPostLiked(postId, userId) {
    const { data } = await sb()
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
    return !!data;
  }

  /* ========== COMMENTS ========== */

  async function getComments(postId) {
    const { data, error } = await sb()
      .from('comments')
      .select(`
        *,
        profile:profiles!comments_user_id_fkey(id,username,display_name,avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function addComment(postId, userId, content) {
    const { data, error } = await sb()
      .from('comments')
      .insert({ post_id: postId, user_id: userId, content })
      .select(`
        *,
        profile:profiles!comments_user_id_fkey(id,username,display_name,avatar_url)
      `)
      .single();
    if (error) throw error;
    return data;
  }

  async function deleteComment(commentId, userId) {
    const { error } = await sb()
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);
    if (error) throw error;
  }

  /* ========== FOLLOWS ========== */

  async function followUser(followerId, followingId) {
    const { error } = await sb()
      .from('follows')
      .upsert({ follower_id: followerId, following_id: followingId },
              { onConflict: 'follower_id,following_id' });
    if (error) throw error;
  }

  async function unfollowUser(followerId, followingId) {
    const { error } = await sb()
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    if (error) throw error;
  }

  async function isFollowing(followerId, followingId) {
    const { data } = await sb()
      .from('follows')
      .select('follower_id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();
    return !!data;
  }

  async function getFollowers(userId) {
    const { data, error } = await sb()
      .from('follows')
      .select('profile:profiles!follows_follower_id_fkey(id,username,display_name,avatar_url,current_mood)')
      .eq('following_id', userId);
    if (error) throw error;
    return (data || []).map(d => d.profile).filter(Boolean);
  }

  async function getFollowing(userId) {
    const { data, error } = await sb()
      .from('follows')
      .select('profile:profiles!follows_following_id_fkey(id,username,display_name,avatar_url,current_mood)')
      .eq('follower_id', userId);
    if (error) throw error;
    return (data || []).map(d => d.profile).filter(Boolean);
  }

  /* ========== PLAYLISTS ========== */

  async function getPlaylists(userId) {
    const { data, error } = await sb()
      .from('playlists')
      .select(`
        *,
        songs_count:playlist_songs(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function getPlaylist(playlistId) {
    const { data, error } = await sb()
      .from('playlists')
      .select(`
        *,
        profile:profiles!playlists_user_id_fkey(id,username,display_name,avatar_url),
        playlist_songs(
          *,
          song:songs(*)
        )
      `)
      .eq('id', playlistId)
      .single();
    if (error) throw error;
    return data;
  }

  async function createPlaylist({ userId, name, description, isPublic = true, coverUrl }) {
    const { data, error } = await sb()
      .from('playlists')
      .insert({ user_id: userId, name, description, is_public: isPublic, cover_url: coverUrl })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function addSongToPlaylist(playlistId, songId, position = 0) {
    const { error } = await sb()
      .from('playlist_songs')
      .upsert({ playlist_id: playlistId, song_id: songId, position },
              { onConflict: 'playlist_id,song_id' });
    if (error) throw error;
  }

  async function removeSongFromPlaylist(playlistId, songId) {
    const { error } = await sb()
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('song_id', songId);
    if (error) throw error;
  }

  /* ========== SONGS ========== */

  async function getSong(songId) {
    const { data, error } = await sb()
      .from('songs')
      .select('*')
      .eq('id', songId)
      .single();
    if (error) throw error;
    return data;
  }

  async function upsertSong({ title, artist, album, coverUrl, audioUrl, duration, spotifyId, genre }) {
    const { data, error } = await sb()
      .from('songs')
      .upsert(
        { title, artist, album, cover_url: coverUrl, audio_url: audioUrl, duration, spotify_id: spotifyId, genre },
        { onConflict: 'spotify_id' }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /* ========== SEARCH ========== */

  async function searchUsers(query, { limit = 10 } = {}) {
    const { data, error } = await sb()
      .from('profiles')
      .select('id,username,display_name,avatar_url,current_mood,bio')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  async function searchPlaylists(query, { limit = 10 } = {}) {
    const { data, error } = await sb()
      .from('playlists')
      .select(`
        *,
        profile:profiles!playlists_user_id_fkey(username,display_name,avatar_url)
      `)
      .ilike('name', `%${query}%`)
      .eq('is_public', true)
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  async function searchSongs(query, { limit = 10 } = {}) {
    const { data, error } = await sb()
      .from('songs')
      .select('*')
      .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  /* ========== MOODS ========== */

  async function getTrendingMoods() {
    const { data, error } = await sb()
      .from('moods')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(7);
    if (error) return [];
    return data || [];
  }

  /* ========== REALTIME ========== */

  function subscribeToPost(postId, onLike, onComment) {
    const sb_ = sb();
    const channel = sb_.channel(`post:${postId}`);

    if (onLike) {
      channel.on('postgres_changes', {
        event: '*', schema: 'public', table: 'likes', filter: `post_id=eq.${postId}`
      }, onLike);
    }

    if (onComment) {
      channel.on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}`
      }, onComment);
    }

    channel.subscribe();
    return channel;
  }

  return {
    getProfile, getProfileByUsername, updateProfile, uploadAvatar,
    getFeedPosts, getPostsByUser, createPost, deletePost,
    likePost, unlikePost, isPostLiked,
    getComments, addComment, deleteComment,
    followUser, unfollowUser, isFollowing, getFollowers, getFollowing,
    getPlaylists, getPlaylist, createPlaylist, addSongToPlaylist, removeSongFromPlaylist,
    getSong, upsertSong,
    searchUsers, searchPlaylists, searchSongs,
    getTrendingMoods,
    subscribeToPost,
  };
})();

window.DB = DB;
