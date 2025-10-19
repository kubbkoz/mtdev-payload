// --- Začiatok súboru: src/plugins/index.ts ---

import { formBuilderPlugin } from "@payloadcms/plugin-form-builder";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { nestedDocsPlugin } from "@payloadcms/plugin-nested-docs"; // NOVÝ IMPORT
import { redirectsPlugin } from "@payloadcms/plugin-redirects"; // NOVÝ IMPORT
import { Plugin } from "payload";
import { GenerateTitle, GenerateURL } from "@payloadcms/plugin-seo/types";
import {
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

import { Page } from "@/payload-types";
import { getServerSideURL } from "@/utilities/getURL";

const generateTitle: GenerateTitle<Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Template` : "Payload Template";
};

const generateURL: GenerateURL<Page> = ({ doc }) => {
  const url = getServerSideURL();
  return doc?.slug ? `${url}/${doc.slug}` : url;
};

export const plugins: Plugin[] = [
  // SEO plugin (už tu bol)
  seoPlugin({
    generateTitle,
    generateURL,
  }),

  // Form builder plugin (už tu bol)
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      admin: {
        group: "Content",
      },
    },
    formOverrides: {
      admin: {
        group: "Content",
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ("name" in field && field.name === "confirmationMessage") {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({
                      enabledHeadingSizes: ["h1", "h2", "h3", "h4"],
                    }),
                  ];
                },
              }),
            };
          }
          return field;
        });
      },
    },
  }), // ---

  // NOVÉ: Pluginy, ktoré chýbali, pridané na správne miesto
  // ---
  nestedDocsPlugin({
    collections: ["pages"], // 'posts' sme odstránili, lebo chýbalo
  }),
  redirectsPlugin({
    collections: ["pages"], // 'posts' sme odstránili, lebo chýbalo
  }),
];
// --- Koniec súboru ---
