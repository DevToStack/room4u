export const normalizeDocumentData = (documentData) => {
    if (!documentData || typeof documentData !== 'object') {
        return { data: {}, images: {} };
    }

    const images = {
        front:
            documentData.front_image_url ||
            documentData.front?.url ||
            null,

        back:
            documentData.back_image_url ||
            documentData.back?.url ||
            null,

        photo:
            documentData.photo_image_url ||
            documentData.photo?.url ||
            null
    };

    return {
        data: documentData,
        images
    };
};

export const extractDocumentUrls = (documentData) => {
    if (!documentData) return {};

    const data = typeof documentData === 'string'
        ? JSON.parse(documentData)
        : documentData;

    const extractedUrls = {};

    // Method 1: Check for nested structure (front.url, back.url)
    if (data.front && data.front.url) {
        extractedUrls.front = data.front.url;
    }
    if (data.back && data.back.url) {
        extractedUrls.back = data.back.url;
    }
    if (data.photo && data.photo.url) {
        extractedUrls.photo = data.photo.url;
    }

    // Method 2: Check for flat structure (front_image_url, back_image_url)
    if (data.front_image_url) {
        extractedUrls.front = data.front_image_url;
    }
    if (data.back_image_url) {
        extractedUrls.back = data.back_image_url;
    }
    if (data.photo_image_url) {
        extractedUrls.photo = data.photo_image_url;
    }

    // Method 3: Generic extraction from any URL fields
    Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string' && value.startsWith('http')) {
            const tabName = key.includes('front') ? 'front' :
                key.includes('back') ? 'back' :
                    key.includes('photo') ? 'photo' :
                        'other';
            if (!extractedUrls[tabName]) {
                extractedUrls[tabName] = value;
            }
        }
    });

    return extractedUrls;
};

export const getDocumentDisplayInfo = (doc) => {
    if (!doc.document_data) return { name: 'No name available', idNumber: 'N/A' };

    const data = typeof doc.document_data === 'string'
        ? JSON.parse(doc.document_data)
        : doc.document_data;

    // Try to get name from various possible fields
    const name = data.name || data.full_name || data.customer_name || 'No name available';

    // Try to get ID number based on document type
    let idNumber = 'N/A';
    if (doc.document_type === 'aadhaar') {
        idNumber = data.aadhaar_number || data.number || 'N/A';
    } else if (doc.document_type === 'pan') {
        idNumber = data.pan_number || data.number || 'N/A';
    } else if (doc.document_type === 'passport') {
        idNumber = data.passport_number || data.number || 'N/A';
    } else if (doc.document_type === 'driving_license') {
        idNumber = data.license_number || data.number || 'N/A';
    } else if (doc.document_type === 'voter_id') {
        idNumber = data.voter_id || data.number || 'N/A';
    } else {
        idNumber = data.number || data.id_number || 'N/A';
    }

    return { name, idNumber };
};

export const getDocumentTypeLabel = (type) => {
    const labels = {
        aadhaar: "Aadhaar Card",
        pan: "PAN Card",
        driving_license: "Driving License",
        passport: "Passport",
        voter_id: "Voter ID"
    };
    return labels[type] || type;
};

export const DOCUMENT_SCHEMAS = {
    aadhaar: {
        required: ['aadhaar_number', 'name', 'dob', 'gender', 'address'],
        labels: {
            aadhaar_number: 'Aadhaar Number',
            name: 'Full Name',
            dob: 'Date of Birth',
            gender: 'Gender',
            address: 'Address'
        }
    },
    pan: {
        required: ['pan_number', 'name', 'dob'],
        labels: {
            pan_number: 'PAN Number',
            name: 'Full Name',
            dob: 'Date of Birth'
        }
    },
    passport: {
        required: ['passport_number', 'name', 'nationality', 'dob', 'place_of_birth'],
        labels: {
            passport_number: 'Passport Number',
            name: 'Full Name',
            nationality: 'Nationality',
            dob: 'Date of Birth',
            place_of_birth: 'Place of Birth'
        }
    },
    driving_license: {
        required: ['license_number', 'name', 'dob', 'valid_from', 'valid_to'],
        labels: {
            license_number: 'License Number',
            name: 'Full Name',
            dob: 'Date of Birth',
            valid_from: 'Valid From',
            valid_to: 'Valid To'
        }
    },
    voter_id: {
        required: ['voter_id', 'name', 'relative_name', 'address'],
        labels: {
            voter_id: 'Voter ID Number',
            name: 'Full Name',
            relative_name: "Relative's Name",
            address: 'Address'
        }
    }
  };