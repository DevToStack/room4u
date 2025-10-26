import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

export default function ReviewCard({ review }) {
    return (
        <div className="border-b border-neutral-800 pb-4 last:border-b-0">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="font-medium text-white">{review.apartment_title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className="text-yellow-400">
                            {Array.from({ length: review.rating }, (_, i) => (
                                <FontAwesomeIcon key={i} icon={faStar} />
                            ))}
                            {Array.from({ length: 5 - review.rating }, (_, i) => (
                                <FontAwesomeIcon key={i} icon={faStar} className="text-neutral-600" />
                            ))}
                        </span>
                        <span className="text-sm text-neutral-500">({review.rating}/5)</span>
                    </div>
                    {review.comment && (
                        <p className="text-neutral-300 mt-2 bg-neutral-800/50 p-3 rounded-lg">
                            {review.comment}
                        </p>
                    )}
                </div>
                <span className="text-sm text-neutral-500 whitespace-nowrap ml-4">
                    {new Date(review.review_date).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
}