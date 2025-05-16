const supabase = require('../config/supabase');

// Lấy danh sách phản hồi của người dùng
const getUserFeedback = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        trainer:trainer_id(id, username, avatar_url)
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: error.message });
  }
};

// Gửi phản hồi (từ huấn luyện viên đến người dùng)
const sendFeedback = async (req, res) => {
  try {
    const { trainer_id, user_id, content, attachment_urls } = req.body;
    
    // Kiểm tra xem huấn luyện viên có quyền gửi phản hồi cho người dùng này không
    const { data: relationship, error: relationshipError } = await supabase
      .from('trainer_user_relationships')
      .select('*')
      .eq('trainer_id', trainer_id)
      .eq('user_id', user_id);
    
    if (relationshipError) throw relationshipError;
    
    if (relationship.length === 0) {
      return res.status(403).json({ message: 'Trainer is not authorized to provide feedback to this user' });
    }
    
    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          trainer_id,
          user_id,
          content,
          attachment_urls: attachment_urls || [],
          is_read: false
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error sending feedback:', error);
    res.status(500).json({ error: error.message });
  }
};

// Gửi media (từ người dùng đến huấn luyện viên) để yêu cầu phản hồi
const sendMediaForFeedback = async (req, res) => {
  try {
    const { user_id, trainer_id, content, media_files } = req.body;
    
    // Upload media files to Supabase Storage
    const media_urls = [];
    for (const file of media_files) {
      const fileName = `${user_id}_${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('feedback-media')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype
        });
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('feedback-media')
        .getPublicUrl(fileName);
      
      media_urls.push(urlData.publicUrl);
    }
    
    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          user_id,
          trainer_id,
          content,
          attachment_urls: media_urls,
          is_read: false
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error sending media for feedback:', error);
    res.status(500).json({ error: error.message });
  }
};

// Đánh dấu phản hồi đã đọc
const markFeedbackAsRead = async (req, res) => {
  try {
    const { feedback_id } = req.params;
    
    const { data, error } = await supabase
      .from('feedback')
      .update({ is_read: true })
      .eq('id', feedback_id)
      .select();

    if (error) throw error;

    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error marking feedback as read:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserFeedback,
  sendFeedback,
  sendMediaForFeedback,
  markFeedbackAsRead
};