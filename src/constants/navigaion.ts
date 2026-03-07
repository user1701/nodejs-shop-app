export const navigation = [
	{ url: "/", text: "Shop" },
	{ url: "/products", text: "Products" },
	{ url: "/cart", text: "Cart", isAuthenticated: true },
	{ url: "/products/add", text: "Add Product", isAuthenticated: true },
	{ url: "/products/my", text: "My Products", isAuthenticated: true },
	{ url: "/orders", text: "Orders", isAuthenticated: true },
];

export const rightNavigation = [
	{ url: "/login", text: "Login" },
	{ url: "/logout", text: "Logout", isAuthenticated: true },
	{ url: "/register", text: "Register" },
];

export default navigation;
