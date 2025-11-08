"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faEnvelope,
    faStar,
    faCommentDots,
    faClipboard,
    faPaperPlane,
    faTags,
    faBug,
    faLightbulb,
    faComments,
    faExclamationTriangle,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

export default function FeedbackForm() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
        rating: 0,
        feedback_type: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [openDropdown, setOpenDropdown] = useState(false);

    const feedbackOptions = [
        { label: "General Feedback", value: "general", icon: faComments, color: "text-teal-400" },
        { label: "Bug Report", value: "bug", icon: faBug, color: "text-red-400" },
        { label: "Feature Request", value: "feature", icon: faLightbulb, color: "text-yellow-400" },
        { label: "Complaint", value: "complaint", icon: faExclamationTriangle, color: "text-orange-400" },
    ];

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to submit feedback");

            setSuccess("✅ Thank you! Your feedback has been submitted.");
            setForm({
                name: "",
                email: "",
                subject: "",
                message: "",
                rating: 0,
                feedback_type: "",
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-10 px-4 bg-neutral-950">
            <form
                onSubmit={handleSubmit}
                className="bg-neutral-900 text-neutral-100 shadow-xl rounded-2xl p-8 w-full max-w-2xl border border-neutral-700 transition-all hover:shadow-2xl"
            >
                <h2 className="text-3xl font-semibold text-center mb-6 text-teal-400">
                    <FontAwesomeIcon icon={faCommentDots} className="mr-2" />
                    Send Us Your Feedback
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="flex items-center border border-neutral-700 bg-neutral-800 rounded-lg p-2 focus-within:ring-2 ring-teal-500">
                        <FontAwesomeIcon icon={faUser} className="text-teal-400 mx-2" />
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full outline-none bg-transparent text-neutral-100 placeholder-neutral-400"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="flex items-center border border-neutral-700 bg-neutral-800 rounded-lg p-2 focus-within:ring-2 ring-teal-500">
                        <FontAwesomeIcon icon={faEnvelope} className="text-teal-400 mx-2" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full outline-none bg-transparent text-neutral-100 placeholder-neutral-400"
                            required
                        />
                    </div>
                </div>

                {/* Subject */}
                <div className="flex items-center border border-neutral-700 bg-neutral-800 rounded-lg p-2 mt-4 focus-within:ring-2 ring-teal-500">
                    <FontAwesomeIcon icon={faClipboard} className="text-teal-400 mx-2" />
                    <input
                        type="text"
                        name="subject"
                        placeholder="Subject"
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full outline-none bg-transparent text-neutral-100 placeholder-neutral-400"
                        required
                    />
                </div>

                {/* Feedback Type (custom dropdown) */}
                <div className="relative mt-4">
                    <button
                        type="button"
                        onClick={() => setOpenDropdown(!openDropdown)}
                        className="w-full flex items-center justify-between border border-neutral-700 bg-neutral-800 rounded-lg p-2 focus-within:ring-2 ring-teal-500"
                    >
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faTags} className="text-teal-400" />
                            {form.feedback_type ? (
                                <span className="text-neutral-100">
                                    {
                                        feedbackOptions.find(
                                            (opt) => opt.value === form.feedback_type
                                        )?.label
                                    }
                                </span>
                            ) : (
                                <span className="text-neutral-500">Select Feedback Type</span>
                            )}
                        </div>
                        <FontAwesomeIcon
                            icon={faChevronDown}
                            className={`text-neutral-400 transform transition-transform ${openDropdown ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {openDropdown && (
                        <div className="absolute w-full mt-2 bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg z-20">
                            {feedbackOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        setForm({ ...form, feedback_type: opt.value });
                                        setOpenDropdown(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-neutral-700 transition ${form.feedback_type === opt.value ? "bg-neutral-700" : ""
                                        }`}
                                >
                                    <FontAwesomeIcon icon={opt.icon} className={`${opt.color}`} />
                                    <span className="text-neutral-200">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Message */}
                <div className="flex items-start border border-neutral-700 bg-neutral-800 rounded-lg p-2 mt-4 focus-within:ring-2 ring-teal-500">
                    <FontAwesomeIcon
                        icon={faCommentDots}
                        className="text-teal-400 mx-2 mt-1"
                    />
                    <textarea
                        name="message"
                        placeholder="Write your feedback..."
                        value={form.message}
                        onChange={handleChange}
                        className="w-full outline-none bg-transparent text-neutral-100 placeholder-neutral-400 min-h-[100px]"
                        required
                    />
                </div>

                {/* Rating with FontAwesome stars */}
                <div className="border border-neutral-700 bg-neutral-800 rounded-lg p-4 mt-4">
                    <label className="flex items-center gap-2 text-neutral-300 mb-2">
                        <FontAwesomeIcon icon={faStar} className="text-teal-400" />
                        Rate Us
                    </label>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <FontAwesomeIcon
                                key={star}
                                icon={faStar}
                                onClick={() => setForm({ ...form, rating: star })}
                                className={`cursor-pointer text-2xl transition-all duration-200 ${star <= form.rating
                                        ? "text-teal-400 drop-shadow-[0_0_6px_rgba(45,212,191,0.8)] scale-110"
                                        : "text-neutral-600 hover:text-teal-500"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`mt-6 w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all ${loading
                            ? "bg-neutral-700 cursor-not-allowed"
                            : "bg-teal-600 hover:bg-teal-700"
                        }`}
                >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {loading ? "Submitting..." : "Submit Feedback"}
                </button>

                {success && (
                    <p className="mt-4 text-teal-400 text-center font-medium">
                        {success}
                    </p>
                )}
                {error && (
                    <p className="mt-4 text-red-500 text-center font-medium">
                        {error}
                    </p>
                )}
            </form>
        </div>
    );
}
