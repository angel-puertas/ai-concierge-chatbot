import { CollectionConfig } from "payload";

const FallbackLogs: CollectionConfig = {
  slug: "fallbackLogs",
  admin: {
    useAsTitle: "question",
    defaultColumns: ["question", "createdAt"],
  },
  timestamps: true,
  fields: [
    {
      name: "question",
      type: "text",
      required: true,
    },
    {
      name: "language",
      type: "text",
    },
    {
      name: "count",
      type: "number",
      defaultValue: 1,
    },
  ],
};

export default FallbackLogs;
