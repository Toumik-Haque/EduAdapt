const CommunityPost = require('../models/CommunityPost')

// Get community feed with optional category filter
const getPosts = async (req, res) => {
  try {
    const { category, search } = req.query
    let filter = {}

    if (category && category !== 'All') {
      filter.category = category
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { content: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } }
      ]
    }

    const posts = await CommunityPost.find(filter)
      .populate('authorId', 'username accountType')
      .populate('comments.authorId', 'username accountType')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    const formattedPosts = posts.map((p) => ({
      ...p,
      authorUsername: p.authorUsername || p.authorId?.username || '',
      comments: (p.comments || []).map((c) => ({
        ...c,
        authorUsername: c.authorUsername || c.authorId?.username || ''
      }))
    }))

    res.json({
      success: true,
      posts: formattedPosts
    })
  } catch (error) {
    console.error('Get posts error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// Create new post
const createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      })
    }

    const post = await CommunityPost.create({
      authorId: req.user.userId,
      authorUsername: req.user.username || '',
      authorName: req.user.name || 'Member',
      authorRole: req.user.accountType,
      title: title.trim(),
      content: content.trim(),
      category: category || 'Discussion',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : []
    })

    res.status(201).json({
      success: true,
      message: 'Post published to community',
      post
    })
  } catch (error) {
    console.error('Create post error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// Like / Unlike post
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params
    const post = await CommunityPost.findById(id)

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' })
    }

    const userIdStr = req.user.userId
    const index = post.likes.findIndex((uid) => uid.toString() === userIdStr)

    if (index > -1) {
      post.likes.splice(index, 1)
    } else {
      post.likes.push(req.user.userId)
    }

    await post.save()

    res.json({
      success: true,
      likesCount: post.likes.length,
      liked: index === -1
    })
  } catch (error) {
    console.error('Like toggle error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// Add comment to post
const addComment = async (req, res) => {
  try {
    const { id } = req.params
    const { text } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text required' })
    }

    const post = await CommunityPost.findById(id)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' })
    }

    const comment = {
      authorId: req.user.userId,
      authorUsername: req.user.username || '',
      authorName: req.user.name || 'Member',
      authorRole: req.user.accountType,
      text: text.trim(),
      createdAt: new Date()
    }

    post.comments.push(comment)
    await post.save()

    res.status(201).json({
      success: true,
      message: 'Comment added',
      comment
    })
  } catch (error) {
    console.error('Add comment error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// Delete post (author or institute only)
const deletePost = async (req, res) => {
  try {
    const { id } = req.params
    const post = await CommunityPost.findById(id)

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' })
    }

    if (post.authorId.toString() !== req.user.userId && req.user.accountType !== 'institute') {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }

    await CommunityPost.findByIdAndDelete(id)
    res.json({ success: true, message: 'Post removed' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

module.exports = {
  getPosts,
  createPost,
  toggleLike,
  addComment,
  deletePost
}
