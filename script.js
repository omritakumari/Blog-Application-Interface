
const $ = id => document.getElementById(id);

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

let users = read("bs_users", []);
let blogs = read("bs_blogs", []);
let session = read("bs_session", null);
let editingId = null;

// Demo articles
if (blogs.length === 0) {
  blogs = [
    {
      id: 101,
      title: "The Future of Artificial Intelligence",
      description: "Discover how AI is changing our everyday lives.",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
      content: "Artificial Intelligence is transforming the modern world. It is changing education, healthcare, business and communication. Learning about AI can help us prepare for the future.",
      author: "Admin",
      authorId: null,
      status: "Published",
      date: "October 30, 2026"
    },
    {
      id: 102,
      title: "How to Become a Successful Programmer",
      description: "Learn the habits and skills of great developers.",
      category: "Programming",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
      content: "Programming requires practice, patience and consistency. Start with basic concepts, build small projects and gradually improve your problem-solving skills.",
      author: "Admin",
      authorId: null,
      status: "Published",
      date: "October 30, 2026"
    },
    {
      id: 103,
      title: "The Importance of Education",
      description: "Education creates opportunities for everyone.",
      category: "Education",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
      content: "Education gives us knowledge, confidence and the ability to make informed decisions. Learning should continue throughout life.",
      author: "Admin",
      authorId: null,
      status: "Published",
      date: "October 30, 2026"
    }
  ];

  localStorage.setItem("bs_blogs", JSON.stringify(blogs));
}

// SAVE DATA
function saveData() {
  localStorage.setItem("bs_users", JSON.stringify(users));
  localStorage.setItem("bs_blogs", JSON.stringify(blogs));
  localStorage.setItem("bs_session", JSON.stringify(session));
}

// SAFE HTML
function safe(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// TOAST MESSAGE
function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");

  setTimeout(() => $("toast").classList.remove("show"), 2500);
}

// NAVIGATION
function navigate(page, section) {
  if (["dashboard", "create"].includes(page) && !session) {
    toast("Please login to continue!");
    page = "login";
  }

  document.querySelectorAll(".page").forEach(p =>
    p.classList.remove("active")
  );

  $(page).classList.add("active");
  $("navigation").classList.remove("open");

  updateNavbar();

  if (page === "home") renderHome();
  if (page === "dashboard") renderDashboard();

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (section) {
    setTimeout(() => {
      $(section).scrollIntoView({ behavior: "smooth" });
    }, 100);
  }
}

function scrollToBlogs() {
  $("blogs").scrollIntoView({ behavior: "smooth" });
}

function toggleMenu() {
  $("navigation").classList.toggle("open");
}

// NAVBAR
function updateNavbar() {
  const loggedIn = !!session;

  $("loginNav").classList.toggle("hidden", loggedIn);
  $("registerNav").classList.toggle("hidden", loggedIn);
  $("dashboardNav").classList.toggle("hidden", !loggedIn);
  $("logoutNav").classList.toggle("hidden", !loggedIn);
}

// DARK MODE
function toggleTheme() {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");

  localStorage.setItem("bs_theme", isDark ? "dark" : "light");
  document.querySelector(".theme-button").textContent =
    isDark ? "☀" : "☾";
}

if (localStorage.getItem("bs_theme") === "dark") {
  document.body.classList.add("dark");
  document.querySelector(".theme-button").textContent = "☀";
}

// REGISTER
$("registerForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = $("regName").value.trim();
  const email = $("regEmail").value.trim().toLowerCase();
  const password = $("regPassword").value;
  const confirm = $("confirmPassword").value;

  if (password.length < 6) {
    toast("Password must have at least 6 characters.");
    return;
  }

  if (password !== confirm) {
    toast("Passwords do not match!");
    return;
  }

  if (users.some(u => u.email === email)) {
    toast("Email already registered!");
    return;
  }

  const user = {
    id: Date.now(),
    name,
    email,
    password
  };

  users.push(user);

  session = {
    id: user.id,
    name: user.name,
    email: user.email
  };

  saveData();
  this.reset();

  toast("Registration successful!");
  navigate("dashboard");
});

// LOGIN
$("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const email = $("loginEmail").value.trim().toLowerCase();
  const password = $("loginPassword").value;

  const user = users.find(u =>
    u.email === email && u.password === password
  );

  if (!user) {
    toast("Invalid email or password!");
    return;
  }

  session = {
    id: user.id,
    name: user.name,
    email: user.email
  };

  saveData();
  this.reset();

  toast("Login successful!");
  navigate("dashboard");
});

// LOGOUT
function logout() {
  session = null;
  saveData();
  toast("You have logged out.");
  navigate("home");
}

// RENDER HOME BLOGS
function renderHome() {
  const search = $("search").value.toLowerCase().trim();
  const category = $("filter").value;

  const filtered = blogs.filter(blog =>
    blog.status === "Published" &&
    (
      blog.title.toLowerCase().includes(search) ||
      blog.description.toLowerCase().includes(search) ||
      blog.content.toLowerCase().includes(search)
    ) &&
    (category === "All" || blog.category === category)
  );

  if (filtered.length === 0) {
    $("blogGrid").innerHTML =
      '<div class="empty">No articles found. Try another search.</div>';
    return;
  }

  $("blogGrid").innerHTML = filtered.map(blog => `
    <div class="blog-card">
      <img src="${safe(blog.image || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800')}"
           alt="${safe(blog.title)}"
           onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800'">

      <div class="blog-info">
        <span class="category">${safe(blog.category)}</span>
        <h3>${safe(blog.title)}</h3>
        <p>${safe(blog.description)}</p>

        <div class="blog-meta">
          By ${safe(blog.author)} · ${safe(blog.date)}
        </div>

        <button class="read-btn" onclick="readBlog(${blog.id})">
          Read Article →
        </button>
      </div>
    </div>
  `).join("");
}

// READ BLOG
function readBlog(id) {
  const blog = blogs.find(b =>
    b.id === id && b.status === "Published"
  );

  if (!blog) return;

  $("articleDetails").innerHTML = `
    <span class="category">${safe(blog.category)}</span>
    <h1>${safe(blog.title)}</h1>

    <div class="blog-meta">
      By ${safe(blog.author)} · ${safe(blog.date)}
    </div>

    <img src="${safe(blog.image || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800')}"
         alt="${safe(blog.title)}">

    <h3>${safe(blog.description)}</h3>
    <p>${safe(blog.content)}</p>
  `;

  navigate("details");
}

// NEW BLOG
function newBlog() {
  editingId = null;
  $("blogForm").reset();
  $("editorHeading").textContent = "Create Your Blog";
  navigate("create");
}

// CREATE OR EDIT BLOG
function saveBlog(status) {
  if (!session) {
    navigate("login");
    return;
  }

  const title = $("blogTitle").value.trim();
  const description = $("blogDescription").value.trim();
  const category = $("blogCategory").value;
  const image = $("blogImage").value.trim();
  const content = $("blogContent").value.trim();

  if (!title || !description || !category || !content) {
    toast("Please fill in all required fields!");
    return;
  }

  if (editingId !== null) {
    const index = blogs.findIndex(b =>
      b.id === editingId && b.authorId === session.id
    );

    if (index === -1) {
      toast("Blog not found!");
      return;
    }

    blogs[index] = {
      ...blogs[index],
      title,
      description,
      category,
      image,
      content,
      status
    };

  } else {
    blogs.unshift({
      id: Date.now(),
      title,
      description,
      category,
      image,
      content,
      author: session.name,
      authorId: session.id,
      status,
      date: new Date().toLocaleDateString()
    });
  }

  saveData();

  $("blogForm").reset();
  editingId = null;

  toast(status === "Published"
    ? "Your blog has been published!"
    : "Your draft has been saved!");

  navigate("dashboard");
}

// PUBLISH
$("blogForm").addEventListener("submit", function(e) {
  e.preventDefault();
  saveBlog("Published");
});

// EDIT BLOG
function editBlog(id) {
  const blog = blogs.find(b =>
    b.id === id && b.authorId === session.id
  );

  if (!blog) return;

  editingId = id;

  $("blogTitle").value = blog.title;
  $("blogDescription").value = blog.description;
  $("blogCategory").value = blog.category;
  $("blogImage").value = blog.image || "";
  $("blogContent").value = blog.content;

  $("editorHeading").textContent = "Edit Your Blog";

  navigate("create");
}

// DELETE BLOG
function deleteBlog(id) {
  const blog = blogs.find(b =>
    b.id === id && b.authorId === session.id
  );

  if (!blog) return;

  if (!confirm("Are you sure you want to delete this blog?")) {
    return;
  }

  blogs = blogs.filter(b => b.id !== id);

  saveData();
  renderDashboard();
  toast("Blog deleted successfully!");
}

// DASHBOARD
function renderDashboard() {
  if (!session) return;

  $("welcomeName").textContent = session.name;

  const myBlogs = blogs.filter(b => b.authorId === session.id);

  $("totalBlogs").textContent = myBlogs.length;

  $("publishedBlogs").textContent =
    myBlogs.filter(b => b.status === "Published").length;

  $("draftBlogs").textContent =
    myBlogs.filter(b => b.status === "Draft").length;

  if (myBlogs.length === 0) {
    $("myBlogs").innerHTML = `
      <tr>
        <td colspan="4" class="empty">
          No blogs yet. Click Create Blog to get started!
        </td>
      </tr>
    `;
    return;
  }

  $("myBlogs").innerHTML = myBlogs.map(blog => `
    <tr>
      <td><strong>${safe(blog.title)}</strong></td>
      <td>${safe(blog.category)}</td>
      <td>
        <span class="status ${blog.status === "Draft" ? "draft" : ""}">
          ${safe(blog.status)}
        </span>
      </td>
      <td>
        <button class="action-btn" onclick="editBlog(${blog.id})">
          Edit
        </button>
        <button class="action-btn delete-btn"
          onclick="deleteBlog(${blog.id})">
          Delete
        </button>
      </td>
    </tr>
  `).join("");
}

// INITIALIZE
updateNavbar();
renderHome();
navigate("home");
