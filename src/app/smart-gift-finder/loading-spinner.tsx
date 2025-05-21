export function LoadingSpinner({ size = "medium" }: { size?: "small" | "medium" | "large" }) {
    const sizeClasses = {
      small: "w-4 h-4 border-2",
      medium: "w-6 h-6 border-2",
      large: "w-8 h-8 border-3",
    }
  
    return (
      <div
        className={`${sizeClasses[size]} border-white border-t-transparent rounded-full animate-spin`}
        aria-hidden="true"
      ></div>
    )
  }
  