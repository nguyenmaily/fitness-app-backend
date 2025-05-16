const supabase = require('../config/supabase');

// Lấy lịch sử thành tích của người dùng
const getUserAchievements = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user_id)
      .order('date_achieved', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: error.message });
  }
};

// Thêm thành tích mới
const createAchievement = async (req, res) => {
  try {
    const { user_id, achievement_type, metrics } = req.body;
    
    const { data, error } = await supabase
      .from('achievements')
      .insert([
        {
          user_id,
          achievement_type,
          metrics,
          date_achieved: new Date(),
          is_shared: false
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({ error: error.message });
  }
};

// Chia sẻ thành tích
const shareAchievement = async (req, res) => {
  try {
    const { achievement_id, share_platforms, media_urls } = req.body;
    
    const { data, error } = await supabase
      .from('achievements')
      .update({
        is_shared: true,
        share_platforms,
        media_urls
      })
      .eq('id', achievement_id)
      .select();

    if (error) throw error;

    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error sharing achievement:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserAchievements,
  createAchievement,
  shareAchievement
};