/**
 * Seed the database with an admin account and a starter product catalogue.
 *
 *   npm run seed              # add anything missing, leave existing data alone
 *   npm run seed -- --fresh   # delete all products first, then reseed
 *
 * Set ADMIN_EMAIL and ADMIN_PASSWORD in .env to control the admin account.
 * Images point at files already in frontend/public, so no Cloudinary upload is
 * needed to get a working catalogue back.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";
import User from "./models/user.model.js";

dotenv.config();

// Category slugs must match categoryMapping in
// frontend/src/components/CreateProductForm.jsx and the hrefs in HomePage.jsx.
const products = [
	{ name: "Soft Activity Cube", description: "A plush sensory cube with rattles, mirrors and crinkle tags.", price: 24.99, image: "/twoYears.jpg", category: "twoYears", isFeatured: true },
	{ name: "Wooden Stacking Rings", description: "Six graded hardwood rings on a rounded base. Non-toxic paint.", price: 18.5, image: "/twoYears.jpg", category: "twoYears" },
	{ name: "Pull-Along Duck", description: "Classic wooden pull toy that waddles and clacks as it rolls.", price: 21.0, image: "/twoYears.jpg", category: "twoYears" },

	{ name: "Collector Anime Figure - Swordsman", description: "1/7 scale PVC figure on a display base. 24 cm tall.", price: 79.99, image: "/animeFigure.jpg", category: "animeFigures", isFeatured: true },
	{ name: "Chibi Figure Set (4 pieces)", description: "Four hand-painted chibi figures with swappable expressions.", price: 42.0, image: "/animeFigure.jpg", category: "animeFigures" },
	{ name: "Mecha Model Kit", description: "Snap-fit articulated model kit, no glue required. 180 parts.", price: 64.5, image: "/animeFigure.jpg", category: "animeFigures" },

	{ name: "RC Off-Road Truck", description: "2.4 GHz remote control truck with rechargeable battery pack.", price: 89.99, image: "/boysWorld.jpg", category: "boysWorld", isFeatured: true },
	{ name: "Dinosaur Excavation Kit", description: "Chisel a fossil skeleton out of a plaster block. Includes tools.", price: 27.0, image: "/boysWorld.jpg", category: "boysWorld" },
	{ name: "Magnetic Building Tiles (60 pc)", description: "Translucent magnetic tiles for open-ended construction play.", price: 54.0, image: "/boysWorld.jpg", category: "boysWorld" },

	{ name: "Dollhouse Furniture Set", description: "Twelve-piece wooden furniture set scaled for a standard dollhouse.", price: 46.0, image: "/girlsWorld.jpg", category: "girlsWorld", isFeatured: true },
	{ name: "Jewellery Making Kit", description: "Beads, cord and clasps for making bracelets and necklaces.", price: 23.5, image: "/girlsWorld.jpg", category: "girlsWorld" },
	{ name: "Plush Unicorn - Large", description: "45 cm plush unicorn with embroidered features and a satin horn.", price: 32.0, image: "/girlsWorld.jpg", category: "girlsWorld" },

	{ name: "Beginner Microscope Set", description: "400x microscope with prepared slides and a specimen kit.", price: 68.0, image: "/educationalGames.jpg", category: "educationalGames", isFeatured: true },
	{ name: "Arabic & English Alphabet Puzzle", description: "Double-sided wooden puzzle covering both alphabets.", price: 19.99, image: "/educationalGames.jpg", category: "educationalGames" },
	{ name: "Solar System Model Kit", description: "Build and paint a motorised eight-planet orrery.", price: 49.0, image: "/educationalGames.jpg", category: "educationalGames" },

	{ name: "Folding Kick Scooter", description: "Aluminium frame, adjustable bar height, rear friction brake.", price: 74.99, image: "/scooter.png", category: "scooters", isFeatured: true },
	{ name: "Three-Wheel Toddler Scooter", description: "Lean-to-steer scooter with light-up wheels for ages 3 to 6.", price: 52.0, image: "/scooter.png", category: "scooters" },
	{ name: "Scooter Safety Set", description: "Helmet with knee and elbow pads. Adjustable, meets EN 1078.", price: 38.0, image: "/scooter.png", category: "scooters" },
];

const seedAdmin = async () => {
	const email = (process.env.ADMIN_EMAIL || "admin@toyzer.store").toLowerCase();
	const password = process.env.ADMIN_PASSWORD;

	const existing = await User.findOne({ email });
	if (existing) {
		if (existing.role !== "admin") {
			existing.role = "admin";
			await existing.save();
			console.log(`   promoted ${email} to admin`);
		} else {
			console.log(`   admin ${email} already exists, left untouched`);
		}
		return;
	}

	if (!password) {
		console.log("   ADMIN_PASSWORD is not set — skipping admin creation.");
		console.log("   Set ADMIN_EMAIL and ADMIN_PASSWORD in .env, then run the seed again.");
		return;
	}

	// The pre-save hook on the model hashes this.
	await User.create({ name: "Admin", email, password, role: "admin" });
	console.log(`   created admin ${email}`);
};

const seedProducts = async ({ fresh }) => {
	if (fresh) {
		const { deletedCount } = await Product.deleteMany({});
		console.log(`   removed ${deletedCount} existing products`);
	}

	let created = 0;
	let skipped = 0;

	for (const product of products) {
		// Name is the natural key here; the schema has no unique index.
		const exists = await Product.findOne({ name: product.name });
		if (exists) {
			skipped++;
			continue;
		}
		await Product.create(product);
		created++;
	}

	console.log(`   created ${created} products, skipped ${skipped} already present`);
};

const run = async () => {
	const fresh = process.argv.includes("--fresh");

	if (!process.env.MONGO_URI) {
		console.error("MONGO_URI is not set. Copy .env.example to .env and fill it in.");
		process.exit(1);
	}

	try {
		await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15_000 });
		console.log(`Connected to ${mongoose.connection.host}`);

		console.log("Seeding admin:");
		await seedAdmin();

		console.log(`Seeding products${fresh ? " (fresh)" : ""}:`);
		await seedProducts({ fresh });

		console.log("Done.");
		process.exitCode = 0;
	} catch (error) {
		console.error("Seed failed:", error.message);
		process.exitCode = 1;
	} finally {
		await mongoose.disconnect();
	}
};

run();
