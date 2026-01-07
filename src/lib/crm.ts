import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (using environment variables)
// These should be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Lazy initialization to prevent build crash if env vars are missing
const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

/**
 * Capture customer email and store in CRM/Supabase.
 * @param email - The customer's email address
 * @param cartId - The active cart ID for reference
 */
export async function retrieveEmail(email: string, cartId?: string) {
  if (!supabase) {
    console.warn('⚠️ CRM: Supabase client not initialized. Flipping to simulation mode.');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('customers')
      .upsert([
        { 
          email: email, 
          last_cart_id: cartId,
          updated_at: new Date().toISOString() 
        }
      ], { onConflict: 'email' });

    if (error) {
      console.error('❌ CRM Error:', error.message);
      throw error;
    }

    console.log('✅ CRM: Customer email captured:', email);
    return data;
  } catch (err) {
    console.error('CRM Capture Failed:', err);
  }
}
