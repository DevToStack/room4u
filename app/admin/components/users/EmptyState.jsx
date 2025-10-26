import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

export default function EmptyState({ message }) {
    return (
        <div className="text-center py-10 text-neutral-500">
            <FontAwesomeIcon icon={faEnvelope} className="text-3xl mb-2" />
            <p>{message}</p>
        </div>
    );
}