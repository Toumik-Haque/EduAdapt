const InstituteProfile = require('../models/InstituteProfile')
const User = require('../models/User')
const cloudinary = require('../config/cloudinary')
const streamifier = require('streamifier')

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) {
    return
  }

  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error(
      'Cloudinary image deletion error:',
      error
    )
  }
}

const getInstituteProfile = async (req, res) => {
  try {
    // Only institute accounts can access this profile
    if (req.user.accountType !== 'institute') {
      return res.status(403).json({
        success: false,
        message: 'Only institute accounts can access this profile'
      })
    }

    const profile = await InstituteProfile.findOne({
      userId: req.user.userId
    })

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Institute profile not found'
      })
    }

    res.status(200).json({
      success: true,
      profile
    })
  } catch (error) {
    console.error(
      'Get institute profile error:',
      error
    )

    res.status(500).json({
      success: false,
      message: 'Server error while fetching institute profile'
    })
  }
}

const updateInstituteProfile = async (req, res) => {
  try {
    // Only institute accounts can update institute profile
    if (req.user.accountType !== 'institute') {
      return res.status(403).json({
        success: false,
        message: 'Only institute accounts can update institute profile'
      })
    }

    const {
      username,
      instituteName,
      instituteType,
      about,
      phone,
      address,
      city,
      state,
      country,
      website,
      facebook,
      instagram,
      linkedin,
      youtube
    } = req.body

    // Handle username update if provided
    let updatedUsername = undefined
    if (username !== undefined) {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
      if (cleanUsername.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Username must be at least 3 alphanumeric characters'
        })
      }

      const existing = await User.findOne({
        username: cleanUsername,
        _id: { $ne: req.user.userId }
      })

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'This username is already taken. Please choose another.'
        })
      }

      await User.findByIdAndUpdate(req.user.userId, { username: cleanUsername })
      updatedUsername = cleanUsername
    }

    const profile = await InstituteProfile.findOne({
      userId: req.user.userId
    })

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Institute profile not found'
      })
    }

    // Required Phone validation
    if (phone !== undefined && !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Contact phone number is required'
      })
    }

    // Required Location validation
    if (
      (address !== undefined && !address.trim()) ||
      (city !== undefined && !city.trim()) ||
      (state !== undefined && !state.trim()) ||
      (country !== undefined && !country.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Complete location details (address, city, state, country) are required'
      })
    }

    // Update basic profile information
    if (instituteName !== undefined) {
      profile.instituteName = instituteName
    }

    if (instituteType !== undefined) {
      profile.instituteType = instituteType
    }

    if (about !== undefined) {
      profile.about = about
    }

    // Contact
    if (phone !== undefined) {
      profile.contact.phone = phone
    }

    // Location
    if (address !== undefined) {
      profile.location.address = address
    }

    if (city !== undefined) {
      profile.location.city = city
    }

    if (state !== undefined) {
      profile.location.state = state
    }

    if (country !== undefined) {
      profile.location.country = country
    }

    // Website
    if (website !== undefined) {
      profile.website = website
    }

    // Social links
    if (facebook !== undefined) {
      profile.socialLinks.facebook = facebook
    }

    if (instagram !== undefined) {
      profile.socialLinks.instagram = instagram
    }

    if (linkedin !== undefined) {
      profile.socialLinks.linkedin = linkedin
    }

    if (youtube !== undefined) {
      profile.socialLinks.youtube = youtube
    }

    await profile.save()

    res.status(200).json({
      success: true,
      message: 'Institute profile updated successfully',
      username: updatedUsername,
      profile
    })
  } catch (error) {
    console.error(
      'Update institute profile error:',
      error
    )

    res.status(500).json({
      success: false,
      message: 'Server error while updating institute profile'
    })
  }
}

const uploadInstituteProfilePhoto = async (req, res) => {
  try {
    if (req.user.accountType !== 'institute') {
      return res.status(403).json({
        success: false,
        message: 'Only institute accounts can upload profile photos'
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Profile photo is required'
      })
    }

    const profile = await InstituteProfile.findOne({
      userId: req.user.userId
    })

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Institute profile not found'
      })
    }

    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'eduadapt/institute-profiles',
            resource_type: 'image'
          },
          (error, result) => {
            if (error) {
              reject(error)
            } else {
              resolve(result)
            }
          }
        )

        streamifier
          .createReadStream(req.file.buffer)
          .pipe(uploadStream)
      })
    }

    const oldPublicId = profile.profilePhoto?.publicId

    const result = await uploadToCloudinary()

    profile.profilePhoto.url = result.secure_url
    profile.profilePhoto.publicId = result.public_id

    await profile.save()

    if (oldPublicId) {
      await deleteCloudinaryImage(oldPublicId)
    }

    res.status(200).json({
      success: true,
      message: 'Institute profile photo uploaded successfully',
      profilePhoto: profile.profilePhoto
    })
  } catch (error) {
    console.error(
      'Upload institute profile photo error:',
      error
    )

    res.status(500).json({
      success: false,
      message: 'Server error while uploading profile photo'
    })
  }
}

const uploadInstituteCoverPhoto = async (req, res) => {
  try {
    if (req.user.accountType !== 'institute') {
      return res.status(403).json({
        success: false,
        message: 'Only institute accounts can upload cover photos'
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Cover photo is required'
      })
    }

    const profile = await InstituteProfile.findOne({
      userId: req.user.userId
    })

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Institute profile not found'
      })
    }

    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'eduadapt/institute-covers',
            resource_type: 'image'
          },
          (error, result) => {
            if (error) {
              reject(error)
            } else {
              resolve(result)
            }
          }
        )

        streamifier
          .createReadStream(req.file.buffer)
          .pipe(uploadStream)
      })
    }

    const oldPublicId = profile.coverPhoto?.publicId

    const result = await uploadToCloudinary()

    profile.coverPhoto.url = result.secure_url
    profile.coverPhoto.publicId = result.public_id

    await profile.save()

    if (oldPublicId) {
      await deleteCloudinaryImage(oldPublicId)
    }

    res.status(200).json({
      success: true,
      message: 'Institute cover photo uploaded successfully',
      coverPhoto: profile.coverPhoto
    })
  } catch (error) {
    console.error(
      'Upload institute cover photo error:',
      error
    )

    res.status(500).json({
      success: false,
      message: 'Server error while uploading cover photo'
    })
  }
}

const deleteInstituteProfilePhoto = async (req, res) => {
  try {
    if (req.user.accountType !== 'institute') {
      return res.status(403).json({
        success: false,
        message: 'Only institute accounts can remove profile photos'
      })
    }

    const profile = await InstituteProfile.findOne({
      userId: req.user.userId
    })

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Institute profile not found'
      })
    }

    const oldPublicId = profile.profilePhoto?.publicId
    if (oldPublicId) {
      await deleteCloudinaryImage(oldPublicId)
    }

    profile.profilePhoto = {
      url: '',
      publicId: ''
    }

    await profile.save()

    res.status(200).json({
      success: true,
      message: 'Profile photo removed successfully',
      profilePhoto: profile.profilePhoto
    })
  } catch (error) {
    console.error('Delete profile photo error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while removing profile photo'
    })
  }
}

const deleteInstituteCoverPhoto = async (req, res) => {
  try {
    if (req.user.accountType !== 'institute') {
      return res.status(403).json({
        success: false,
        message: 'Only institute accounts can remove cover photos'
      })
    }

    const profile = await InstituteProfile.findOne({
      userId: req.user.userId
    })

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Institute profile not found'
      })
    }

    const oldPublicId = profile.coverPhoto?.publicId
    if (oldPublicId) {
      await deleteCloudinaryImage(oldPublicId)
    }

    profile.coverPhoto = {
      url: '',
      publicId: ''
    }

    await profile.save()

    res.status(200).json({
      success: true,
      message: 'Cover banner removed successfully',
      coverPhoto: profile.coverPhoto
    })
  } catch (error) {
    console.error('Delete cover photo error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while removing cover photo'
    })
  }
}

module.exports = {
  getInstituteProfile,
  updateInstituteProfile,
  uploadInstituteProfilePhoto,
  uploadInstituteCoverPhoto,
  deleteInstituteProfilePhoto,
  deleteInstituteCoverPhoto
}