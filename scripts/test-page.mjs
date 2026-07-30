const res = await fetch("http://localhost:3000/admin/drops", { redirect: "follow" });
const html = await res.text();
console.log("status:", res.status);
console.log("has Connect Supabase:", html.includes("Connect Supabase"));
console.log("has shirtId inputs:", (html.match(/name="shirtId"/g) || []).length);
console.log("has Mark sold out:", (html.match(/Mark sold out/g) || []).length);
console.log("has Untitled (seed GC03):", html.includes("Untitled"));
console.log("has Shirt Three (fallback GC03):", html.includes("Shirt Three"));
