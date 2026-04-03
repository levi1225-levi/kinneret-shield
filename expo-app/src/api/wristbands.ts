import { supabase } from '../lib/supabase';
import { PaginatedResponse, PaginationParams } from '../types';

const PAGE_SIZE = 50;

export interface Wristband {
  id: string;
  card_uid: string;
  camper_id?: string;
  label?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  camper?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

/**
 * Get all wristbands with pagination, joined with camper info
 */
export const getWristbands = async (
  pagination?: PaginationParams
): Promise<PaginatedResponse<Wristband>> => {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? PAGE_SIZE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('nfc_wristbands')
    .select(
      `
      id,
      card_uid,
      camper_id,
      label,
      is_active,
      created_at,
      updated_at,
      camper:campers(id, first_name, last_name)
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch wristbands: ${error.message}`);
  }

  return {
    items: (data as unknown as Wristband[]) || [],
    total: count || 0,
    page,
    limit,
    pages: Math.ceil((count || 0) / limit),
  };
};

/**
 * Assign a wristband to a camper
 */
export const assignWristband = async (
  wristbandId: string,
  camperId: string
): Promise<Wristband> => {
  const { data, error } = await supabase
    .from('nfc_wristbands')
    .update({ camper_id: camperId })
    .eq('id', wristbandId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to assign wristband: ${error.message}`);
  }

  return data;
};

/**
 * Unassign a wristband from a camper
 */
export const unassignWristband = async (wristbandId: string): Promise<Wristband> => {
  const { data, error } = await supabase
    .from('nfc_wristbands')
    .update({ camper_id: null })
    .eq('id', wristbandId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to unassign wristband: ${error.message}`);
  }

  return data;
};

/**
 * Register a new wristband
 */
export const registerWristband = async (
  cardUid: string,
  label?: string
): Promise<Wristband> => {
  const { data, error } = await supabase
    .from('nfc_wristbands')
    .insert({
      card_uid: cardUid,
      label,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to register wristband: ${error.message}`);
  }

  return data;
};

/**
 * Deactivate a wristband
 */
export const deactivateWristband = async (id: string): Promise<Wristband> => {
  const { data, error } = await supabase
    .from('nfc_wristbands')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to deactivate wristband: ${error.message}`);
  }

  return data;
};
