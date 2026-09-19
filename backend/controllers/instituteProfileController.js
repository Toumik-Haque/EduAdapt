const InstituteProfile = require('../models/InstituteProfile')
const cloudinary = require('../config/cloudinary')
const streamifier = require('streamifier')

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

    const profile = await InstituteProfile.findOne({
      userId: req.user.userId
    })

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Institute profile not found'
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

    const result = await uploadToCloudinary()

    profile.profilePhoto.url = result.secure_url
    profile.profilePhoto.publicId = result.public_id

    await profile.save()

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

    const result = await uploadToCloudinary()

    profile.coverPhoto.url = result.secure_url
    profile.coverPhoto.publicId = result.public_id

    await profile.save()

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

module.exports = {
  getInstituteProfile,
  updateInstituteProfile,
  uploadInstituteProfilePhoto,
  uploadInstituteCoverPhoto
}