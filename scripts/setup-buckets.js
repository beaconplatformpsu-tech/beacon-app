import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBuckets() {
  const bucketsToCreate = [
    { name: "avatars", public: true },
    { name: "cv-files", public: false },
    { name: "project-submissions", public: false },
    { name: "resource-files", public: true },
    { name: "public-assets", public: true },
  ];

  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error("Error listing buckets:", listError);
    process.exit(1);
  }

  console.log("Existing buckets:", existingBuckets.map(b => b.name));

  for (const bucket of bucketsToCreate) {
    const exists = existingBuckets.some(b => b.name === bucket.name);
    if (!exists) {
      console.log(`Creating bucket: ${bucket.name} (public: ${bucket.public})`);
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: 10485760, // 10MB
      });
      if (error) {
        console.error(`Failed to create ${bucket.name}:`, error);
      } else {
        console.log(`Successfully created ${bucket.name}`);
      }
    } else {
      console.log(`Bucket ${bucket.name} already exists. Updating public status to ${bucket.public}...`);
      const { data, error } = await supabase.storage.updateBucket(bucket.name, {
        public: bucket.public,
      });
      if (error) {
         console.error(`Failed to update ${bucket.name}:`, error);
      } else {
         console.log(`Successfully updated ${bucket.name}`);
      }
    }
  }

  console.log("Bucket setup complete.");
}

setupBuckets();
