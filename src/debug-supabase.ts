// Test file to debug Supabase connection
import { supabase } from "@/integrations/supabase/client";

console.log("Testing Supabase connection...");
console.log("Supabase URL:", supabase.supabaseUrl);
console.log("Supabase Key:", supabase.supabaseKey.substring(0, 20) + "...");

// Test basic connection
supabase.from('test').select('*').limit(1)
  .then(result => {
    console.log("Connection test result:", result);
  })
  .catch(error => {
    console.log("Connection test error:", error);
  });

// Test function exists
console.log("Testing function call...");
supabase.functions.invoke('send-taxpayer-form', {
  body: { test: "connection" }
}).then(result => {
  console.log("Function test result:", result);
}).catch(error => {
  console.log("Function test error:", error);
});