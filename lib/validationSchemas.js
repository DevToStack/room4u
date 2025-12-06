// validationSchemas.js
export const documentSchemas = {
    aadhaar: {
        required: ['aadhaar_number', 'name', 'dob', 'gender', 'address', 'state', 'pincode', 'photo_url', 'front_image_url', 'back_image_url']
    },
    pan: {
        required: ['pan_number', 'name', 'father_name', 'dob', 'photo_url']
    },
    driving_license: {
        required: ['dl_number', 'name', 'dob', 'validity_from', 'validity_to', 'address', 'rto', 'front_image_url', 'back_image_url']
    },
    passport: {
        required: ['passport_number', 'name', 'dob', 'nationality', 'place_of_issue', 'expiry_date', 'front_image_url']
    },
    voter_id: {
        required: ['epic_number', 'name', 'father_or_mother_name', 'dob', 'address', 'front_image_url']
    }
};
