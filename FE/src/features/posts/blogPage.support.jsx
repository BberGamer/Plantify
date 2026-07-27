// blogPage.support.jsx - Cung cấp dữ liệu và thành phần hỗ trợ hiển thị trang blog
import { Star } from "lucide-react";

const categories = [
  "Tất cả",
  "Hướng dẫn",
  "Bệnh & Điều trị",
  "Phòng ngừa",
  "Chăm sóc",
  "Thiết kế",
  "Kỹ thuật"
];

const BLOG_GRID_PAGE_SIZE = 6;
const BLOG_FIRST_PAGE_LIMIT = BLOG_GRID_PAGE_SIZE + 1;

const vietnameseTextReplacements = [
  [/\bBai dau tien\b/gi, "Bài đầu tiên"],
  [/\bBai (?=\d)/g, "Bài "],
  [/\bbai (?=\d)/g, "bài "],
  [/\bquoc anh\b/gi, "Quốc Anh"],
  [/\bTat ca\b/gi, "Tất cả"],
  [/\bHuong dan\b/gi, "Hướng dẫn"],
  [/\bBenh & Dieu tri\b/gi, "Bệnh & Điều trị"],
  [/\bPhong ngua\b/gi, "Phòng ngừa"],
  [/\bCham soc\b/gi, "Chăm sóc"],
  [/\bThiet ke\b/gi, "Thiết kế"],
  [/\bKy thuat\b/gi, "Kỹ thuật"]
];

function formatVietnameseDisplayText(value) {
  if (typeof value !== "string") {
    return value;
  }

  return vietnameseTextReplacements.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    value
  );
}

/**
 * Format ngày tạo bài viết để hiển thị trong UI blog.
 * @param {string|Date} date - Ngày tạo bài viết từ API
 * @returns {string} Ngày đã format theo tiếng Việt
 */
function formatPostDate(date) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

function getPostPreview(content = "", maxLength = 140) {
  const plainText = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength).trim()}...`;
}

function getPostIdentity(post) {
  return post?._id || post?.id;
}

function compareFeaturedPosts(postA, postB) {
  const commentsDelta = (Number(postB.commentsCount) || 0) - (Number(postA.commentsCount) || 0);

  if (commentsDelta !== 0) {
    return commentsDelta;
  }

  return new Date(postB.createdAt || 0).getTime() - new Date(postA.createdAt || 0).getTime();
}

function RatingSummary({ value }) {
  const safeValue = Math.max(0, Math.min(Number(value) || 0, 5));

  return (
    <div className="flex items-center gap-1 text-amber-500">
      <Star className={`h-4 w-4 ${safeValue > 0 ? "fill-current" : ""}`} />
      <span className="text-sm font-medium text-foreground">{safeValue.toFixed(1)}</span>
    </div>
  );
}

/**
 * Chuẩn hóa dữ liệu bài viết từ API về shape UI đang sử dụng.
 * @param {Object} post - Bài viết từ backend
 * @returns {Object} Bài viết đã map field cho Blog page
 */
function mapPostToBlogCard(post) {
  const content = formatVietnameseDisplayText(post.content);

  return {
    ...post,
    id: post._id,
    title: formatVietnameseDisplayText(post.title),
    content,
    category: formatVietnameseDisplayText(post.category),
    author: formatVietnameseDisplayText(post.author),
    image: post.thumbnail || post.images?.[0] || "",
    date: formatPostDate(post.createdAt),
    preview: getPostPreview(content)
  };
}


export {
  BLOG_FIRST_PAGE_LIMIT,
  BLOG_GRID_PAGE_SIZE,
  RatingSummary,
  categories,
  compareFeaturedPosts,
  getPostIdentity,
  mapPostToBlogCard,
};
