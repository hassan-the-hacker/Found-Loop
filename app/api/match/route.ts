import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateMatchScore } from '@/lib/matching-engine';
import { LostItem, FoundItem } from '@/types/app';

export async function POST(request: Request) {
  try {
    const { itemId, itemType } = await request.json();

    if (!itemId || !itemType) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const supabase = createClient();

    if (itemType === 'LOST') {
      // 1. Fetch this lost item
      const { data: lostItemData } = await supabase
        .from('lost_items')
        .select('*')
        .eq('id', itemId)
        .single();

      const lostItem = lostItemData as unknown as LostItem | null;
      if (!lostItem) {
        return NextResponse.json({ error: 'Lost item not found' }, { status: 404 });
      }

      // 2. Fetch candidate found items with matching category
      const { data: foundCandidates } = await supabase
        .from('found_items')
        .select('*')
        .eq('category', lostItem.category)
        .eq('status', 'AVAILABLE');

      if (!foundCandidates || foundCandidates.length === 0) {
        return NextResponse.json({ matchedCount: 0 });
      }

      // 3. Score candidates
      let matchesSaved = 0;
      for (const found of foundCandidates as unknown as FoundItem[]) {
        const result = calculateMatchScore(lostItem, found);

        // Keep matches with 50%+ similarity
        if (result.score >= 50) {
          await (supabase.from('potential_matches') as any).upsert(
            {
              lost_item_id: lostItem.id,
              found_item_id: found.id,
              similarity_score: result.score,
              tier: result.tier,
              matched_fields: result.matchedFields,
              reasons: result.reasons,
              status: 'SUGGESTED',
            },
            { onConflict: 'lost_item_id,found_item_id' }
          );
          matchesSaved++;
        }
      }

      return NextResponse.json({ success: true, matchesSaved });
    } else if (itemType === 'FOUND') {
      // 1. Fetch this found item
      const { data: foundItemData } = await supabase
        .from('found_items')
        .select('*')
        .eq('id', itemId)
        .single();

      const foundItem = foundItemData as unknown as FoundItem | null;
      if (!foundItem) {
        return NextResponse.json({ error: 'Found item not found' }, { status: 404 });
      }

      // 2. Fetch candidate lost items
      const { data: lostCandidates } = await supabase
        .from('lost_items')
        .select('*')
        .eq('category', foundItem.category)
        .eq('status', 'REPORTED');

      if (!lostCandidates || lostCandidates.length === 0) {
        return NextResponse.json({ matchedCount: 0 });
      }

      let matchesSaved = 0;
      for (const lost of lostCandidates as unknown as LostItem[]) {
        const result = calculateMatchScore(lost, foundItem);

        if (result.score >= 50) {
          await (supabase.from('potential_matches') as any).upsert(
            {
              lost_item_id: lost.id,
              found_item_id: foundItem.id,
              similarity_score: result.score,
              tier: result.tier,
              matched_fields: result.matchedFields,
              reasons: result.reasons,
              status: 'SUGGESTED',
            },
            { onConflict: 'lost_item_id,found_item_id' }
          );
          matchesSaved++;
        }
      }

      return NextResponse.json({ success: true, matchesSaved });
    }

    return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Matching engine failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

