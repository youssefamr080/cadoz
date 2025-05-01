"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, Star } from "lucide-react"; 
import InspirationComments from "@/components/gift/InspirationComments"; 
import InspirationReactions from "@/components/gift/InspirationReactions"; 
import InspirationStars from "@/components/gift/InspirationStars";       
import useAuthStore from "@/lib/stores/useAuthStore";
import type { Inspiration } from "@/types/inspiration";
import { Badge } from "@/components/ui/badge"; 
import { Card } from "@/components/ui/card";   
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { Button } from "@/components/ui/button"; 

interface Props {
	inspiration: Inspiration;
}

export default function InspirationClient({ inspiration }: Props) {
	const { user, checkSession } = useAuthStore();
	const userId = user?.id || null;
	const userName = user?.name || null;

	useEffect(() => {
		checkSession();
	}, [checkSession]);

	// --- Local State for Interactivity ---
	const [likes, setLikes] = useState(inspiration.likes ?? 0);
	const [dislikes, setDislikes] = useState(inspiration.dislikes ?? 0);
	const [likedBy, setLikedBy] = useState<string[]>(inspiration.likedBy ?? []);
	const [dislikedBy, setDislikedBy] = useState<string[]>(
		inspiration.dislikedBy ?? []
	);
	const [comments, setComments] = useState(inspiration.comments ?? []);
	const [rating, setRating] = useState(inspiration.rating ?? 0);
	const [reviews, setReviews] = useState(inspiration.reviews ?? 0);

	// --- Animation State ---
	const [isVisible, setIsVisible] = useState(false);
	useEffect(() => {
		setIsVisible(true);
	}, []);

	// --- Handlers ---
	const handleReact = async (type: "like" | "dislike") => {
		if (!userId) {
			showAuthPopup();
			return;
		}

        // This function is called after the API call in InspirationReactions component
        // The API now handles the toggle logic and returns the updated state
        // We just need to refresh the inspiration data to show accurate counts
        
        try {
            // Fetch the latest data for this inspiration to get updated counts
            const response = await fetch(`/api/gift/inspirations/${inspiration.id}`);
            if (response.ok) {
                const data = await response.json();
                // Update all reaction-related state with fresh data from the server
                setLikes(data.likes || 0);
                setDislikes(data.dislikes || 0);
                setLikedBy(data.likedBy || []);
                setDislikedBy(data.dislikedBy || []);
            }
        } catch (error) {
            console.error("Error refreshing inspiration data:", error);
            // Fallback to toggle logic if API fails
            let newLikes = likes;
            let newDislikes = dislikes;
            let newLikedBy = [...likedBy];
            let newDislikedBy = [...dislikedBy];

            if (type === "like") {
                if (newLikedBy.includes(userId)) {
                    newLikedBy = newLikedBy.filter((id) => id !== userId);
                    newLikes = Math.max(0, newLikes - 1);
                } else {
                    newLikedBy.push(userId);
                    newLikes++;
                    if (newDislikedBy.includes(userId)) {
                        newDislikedBy = newDislikedBy.filter((id) => id !== userId);
                        newDislikes = Math.max(0, newDislikes - 1);
                    }
                }
            } else { // type === 'dislike'
                if (newDislikedBy.includes(userId)) {
                    newDislikedBy = newDislikedBy.filter((id) => id !== userId);
                    newDislikes = Math.max(0, newDislikes - 1);
                } else {
                    newDislikedBy.push(userId);
                    newDislikes++;
                    if (newLikedBy.includes(userId)) {
                        newLikedBy = newLikedBy.filter((id) => id !== userId);
                        newLikes = Math.max(0, newLikes - 1);
                    }
                }
            }

            setLikes(newLikes);
            setDislikes(newDislikes);
            setLikedBy(newLikedBy);
            setDislikedBy(newDislikedBy);
        }
	};

	const handleCommentAdded = (comment: typeof comments[number]) => {
		setComments([comment, ...comments]);
        // NOTE: The comment addition itself should be handled within InspirationComments
        // and call the API there. This handler just updates the *display count*.
	};

	const showAuthPopup = () => {
		// Replace with your actual modal trigger logic
		console.log("Auth popup triggered");
		document.dispatchEvent(new CustomEvent("show-auth-modal"));
	};

	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: inspiration.name,
					text: `Check out this gift inspiration: ${inspiration.name}`,
					url: window.location.href,
				});
			} catch (error) {
				console.error("Error sharing:", error);
			}
		} else {
			navigator.clipboard.writeText(window.location.href).then(() => {
                // Replace with your actual toast notification logic
				console.log("Link copied to clipboard");
				document.dispatchEvent(
					new CustomEvent("show-toast", {
						detail: { message: "تم نسخ الرابط!", type: "success" },
					})
				);
			});
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
			className="bg-gradient-to-br from-purple-50 via-white to-purple-50 rounded-xl shadow-lg p-4 md:p-6 border border-purple-200"
		>
			{/* --- Top Stats & Actions Bar --- */}
			<div className="flex flex-wrap justify-between items-center gap-4 mb-6">
				{/* Likes, Dislikes, Comments */}
				<div className="flex items-center gap-x-5 gap-y-2">
					{/* Like Button */}
					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => handleReact("like")}
						className={`flex items-center cursor-pointer group ${
							!userId ? "cursor-not-allowed opacity-70" : ""
						}`}
						disabled={!userId}
						aria-label="Like this inspiration"
					>
						<ThumbsUp
							className={`w-5 h-5 mr-1 transition-colors duration-200 ${
								likedBy.includes(userId || "")
									? "fill-red-500 text-red-500" // Keep red for strong like feedback
									: "text-gray-400 group-hover:text-red-400"
							}`}
						/>
						<span className="font-medium text-sm text-gray-700 group-hover:text-gray-900">
							{likes}
						</span>
					</motion.button>

					{/* Dislike Button */}
					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => handleReact("dislike")}
						className={`flex items-center cursor-pointer group ${
							!userId ? "cursor-not-allowed opacity-70" : ""
						}`}
                        disabled={!userId}
						aria-label="Dislike this inspiration"
					>
						<ThumbsDown
							className={`w-5 h-5 mr-1 transition-colors duration-200 ${
								dislikedBy.includes(userId || "")
									? "fill-blue-500 text-blue-500" // Keep blue for dislike feedback
									: "text-gray-400 group-hover:text-blue-400"
							}`}
						/>
						<span className="font-medium text-sm text-gray-700 group-hover:text-gray-900">
							{dislikes}
						</span>
					</motion.button>

                    {/* Comment Count */}
					<div className="flex items-center text-gray-500">
						<MessageCircle className="w-5 h-5 mr-1" />
						<span className="font-medium text-sm">{comments.length}</span>
					</div>
				</div>

				{/* Rating & Share */}
				<div className="flex items-center gap-3">
					<motion.div whileHover={{ scale: 1.05 }}>
						<Badge
							variant="outline"
							className="bg-purple-100 text-purple-800 border-purple-300 px-3 py-1.5 text-sm font-semibold shadow-sm"
						>
							<Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-500" />
							{rating > 0 ? rating.toFixed(1) : "N/A"}
							<span className="ml-1 text-purple-600">({reviews})</span>
						</Badge>
					</motion.div>

					<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
						<Button
							variant="outline"
							size="icon"
							onClick={handleShare}
							className="bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-200 hover:border-purple-300 rounded-full w-9 h-9"
                            aria-label="Share this inspiration"
						>
							<Share2 className="w-4 h-4" />
						</Button>
					</motion.div>
				</div>
			</div>

			{/* --- Tabs for Reactions/Comments --- */}
			<Tabs defaultValue="reactions" className="w-full">
				<TabsList className="grid w-full grid-cols-2 bg-purple-100/70 rounded-lg p-1 h-11">
					<TabsTrigger
						value="reactions"
						className="text-purple-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
					>
						التقييم والتفاعل
					</TabsTrigger>
					<TabsTrigger
						value="comments"
						className="text-purple-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
					>
						التعليقات ({comments.length})
					</TabsTrigger>
				</TabsList>

				{/* Reactions Tab Content */}
				<TabsContent value="reactions" className="mt-5">
					<AnimatePresence mode="wait">
						<motion.div
							key="reactions"
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 10 }}
							transition={{ duration: 0.3 }}
						>
							<Card className="p-4 md:p-6 bg-white border-purple-100 shadow-sm rounded-lg">
								<h4 className="text-lg font-semibold mb-5 text-purple-800 text-center">
									ما رأيك في هذه الهدية؟ قيمها وشاركنا إعجابك!
								</h4>

								{/* Star Rating Component */}
								<div className="mb-8 border-b border-purple-100 pb-6">
									<InspirationStars
										inspirationId={inspiration.id}
										userId={userId}
										avgRating={rating}
										reviews={reviews}
										onRated={(newRating, newReviews) => {
											setRating(newRating);
											setReviews(newReviews);
                                            // API call should be inside InspirationStars
										}}
									/>
								</div>

								{/* Like/Dislike Interaction Area */}
								<InspirationReactions
									inspirationId={inspiration.id}
									likes={likes}
									dislikes={dislikes}
									likedBy={likedBy}
									dislikedBy={dislikedBy}
									userId={userId}
									onReact={handleReact} // Pass the main handler
								/>
							</Card>
						</motion.div>
					</AnimatePresence>
				</TabsContent>

				{/* Comments Tab Content */}
				<TabsContent value="comments" className="mt-5">
					<AnimatePresence mode="wait">
						<motion.div
							key="comments"
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 10 }}
							transition={{ duration: 0.3 }}
						>
							<Card className="p-4 md:p-6 bg-white border-purple-100 shadow-sm rounded-lg">
								{/* Comments Component */}
								<InspirationComments
									inspirationId={inspiration.id}
									comments={comments}
									userId={userId}
									userName={userName}
									onCommentAdded={handleCommentAdded} // Updates count visually
								/>
							</Card>
						</motion.div>
					</AnimatePresence>
				</TabsContent>
			</Tabs>
		</motion.div>
	);
}