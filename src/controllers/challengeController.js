const supabase = require('../config/supabase');

// Lấy danh sách thử thách
const getChallenges = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: error.message });
  }
};

// Tham gia thử thách
const joinChallenge = async (req, res) => {
  try {
    const { user_id, challenge_id } = req.body;
    
    // Kiểm tra xem đã tham gia thử thách này chưa
    const { data: existingData, error: existingError } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', user_id)
      .eq('challenge_id', challenge_id);
    
    if (existingError) throw existingError;
    
    if (existingData.length > 0) {
      return res.status(400).json({ message: 'User already joined this challenge' });
    }
    
    const { data, error } = await supabase
      .from('user_challenges')
      .insert([
        {
          user_id,
          challenge_id,
          join_date: new Date(),
          progress: 0,
          completed: false
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({ error: error.message });
  }
};

// Lấy bảng xếp hạng của một thử thách
const getChallengeLeaderboard = async (req, res) => {
  try {
    const { challenge_id } = req.params;
    
    const { data, error } = await supabase
      .from('user_challenges')
      .select(`
        *,
        users:user_id(id, username, avatar_url)
      `)
      .eq('challenge_id', challenge_id)
      .order('progress', { ascending: false });

    if (error) throw error;

    // Cập nhật thứ hạng dựa trên tiến độ
    const leaderboard = data.map((entry, index) => ({
      ...entry,
      ranking: index + 1
    }));

    // Cập nhật thứ hạng trong cơ sở dữ liệu
    for (const entry of leaderboard) {
      await supabase
        .from('user_challenges')
        .update({ ranking: entry.ranking })
        .eq('id', entry.id);
    }

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
};

// Lấy danh sách huy hiệu của người dùng
const getUserBadges = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:badge_id(*)
      `)
      .eq('user_id', user_id);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching user badges:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getChallenges,
  joinChallenge,
  getChallengeLeaderboard,
  getUserBadges
};