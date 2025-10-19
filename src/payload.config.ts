import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { vercelPostgresAdapter } from "@payloadcms/db-vercel-postgres";

import sharp from "sharp"; // sharp-import
import path from "path";
import { buildConfig, PayloadRequest } from "payload";
import { fileURLToPath } from "url";

// ---
// NOVÉ: Importy pre e-commerce šablónu
// ---
import { nestedDocs } from "@payloadcms/plugin-nested-docs";
import { redirects } from "@payloadcms/plugin-redirects";
import { seo } from "@payloadcms/plugin-seo";
import { ProductsCollection } from "./collections/Products"; // NOVÉ: Kolekcia produktov
// import Orders from "./collections/Orders"; // NOVÉ: Kolekcia objednávok
import BeforeLogin from "./components/BeforeLogin"; // NOVÉ: Komponent pre prihlásenie
import AfterDashboard from "./components/AfterDashboard"; // NOVÉ: Komponent pre dashboard
// ---

import { Categories } from "./collections/Categories";
import { Media } from "./collections/Media";
import { Pages } from "./collections/Pages";
// import { Posts } from "./collections/Posts";
import { Users } from "./collections/Users";

// UPRAVENÉ: Importy pre Globals, aby zodpovedali e-commerce šablóne
import { Footer } from "./globals/Footer"; // UPRAVENÉ (cesta)
import { Header } from "./globals/Header"; // UPRAVENÉ (cesta)

import { plugins } from "./plugins";
// import { defaultLexical } from "@/fields/defaultLexical";
import { getServerSideURL } from "./utilities/getURL";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    components: {
      // UPRAVENÉ: Vrátené do pôvodného stavu
      beforeLogin: ["@/components/BeforeLogin"],
      beforeDashboard: ["@/components/BeforeDashboard"],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: "Mobile",
          name: "mobile",
          width: 375,
          height: 667,
        },
        {
          label: "Tablet",
          name: "tablet",
          width: 768,
          height: 1024,
        },
        {
          label: "Desktop",
          name: "desktop",
          width: 1440,
          height: 900,
        },
      ],
    },
  }, // This config helps us configure global or default features that the other editors can inherit
  // editor: defaultLexical,
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || "",
    },
  }), // UPRAVENÉ: Pridané nové kolekcie Products a Orders
  collections: [Pages, Media, Categories, Users, ProductsCollection],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer], // UPRAVENÉ: Pridané pluginy z e-commerce šablóny
  plugins: [
    ...plugins,
    // ---
    // NOVÉ: Pluginy pre e-commerce
    // ---
    nestedDocs({
      collections: ["pages"],
    }),
    redirects({
      collections: ["pages"],
    }),
    seo({
      collections: ["pages"],
      uploadsCollection: "media",
    }),
    // ---
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || "",
    }),
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true; // If there is no logged in user, then check // for the Vercel Cron secret to be present as an // Authorization header:

        const authHeader = req.headers.get("authorization");
        return authHeader === `Bearer ${process.env.CRON_SECRET}`;
      },
    },
    tasks: [],
  },
});
