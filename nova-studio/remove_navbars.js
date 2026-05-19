const fs = require('fs');

const files = [
  "c:/Users/Murat/Desktop/odelink-shop-main/nova-studio/src/app/shop/[category]/page.tsx",
  "c:/Users/Murat/Desktop/odelink-shop-main/nova-studio/src/app/shop/ShopClient.tsx",
  "c:/Users/Murat/Desktop/odelink-shop-main/nova-studio/src/app/product/[slug]/ProductClient.tsx",
  "c:/Users/Murat/Desktop/odelink-shop-main/nova-studio/src/app/policies/kvkk/page.tsx",
  "c:/Users/Murat/Desktop/odelink-shop-main/nova-studio/src/app/not-found.tsx",
  "c:/Users/Murat/Desktop/odelink-shop-main/nova-studio/src/app/cart/page.tsx",
  "c:/Users/Murat/Desktop/odelink-shop-main/nova-studio/src/app/blog/page.tsx",
  "c:/Users/Murat/Desktop/odelink-shop-main/nova-studio/src/app/account/page.tsx"
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import Navbar from "@\/components\/layout\/navbar";\r?\n?/g, '');
    content = content.replace(/[ \t]*<Navbar \/>\r?\n?/g, '');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
