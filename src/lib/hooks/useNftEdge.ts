"use client";

import { useCallback, useEffect, useState } from "react";

export interface NftAssetSummary {
  id: string;
  name: string;
  number: number | null;
  image_url: string;
  owner?: string | null;
}

export interface NftCollection {
  id: string;
  symbol: string;
  name: string | null;
  image: string | null;
  description: string | null;
  total_supply: number | null;
  royalty_bps: number | null;
}

export interface NftAttribute {
  trait_type?: string;
  value?: unknown;
}

export interface NftAssetDetail {
  id: string;
  collection_id: string;
  name: string;
  number: number | null;
  image_url: string;
  metadata_url: string | null;
  description: string | null;
  attributes: NftAttribute[];
  interface: string | null;
  is_compressed: boolean;
  owner: string | null;
}

export interface RarityEntry {
  count: number;
  floor_lamports: number | null;
  trait_image: string | null;
}

export interface AssetDetailPayload {
  asset: NftAssetDetail;
  collection: NftCollection;
  rarity: Record<string, RarityEntry>;
  live: {
    floorPrice: number | null;
    listedCount: number | null;
    listStatus: string | null;
    listPrice: number | null;
  };
}

const RAIL_PAGE_SIZE = 100;

export function useNftEdge(collectionMint: string, sessionWallet: string | null) {
  const [collection, setCollection] = useState<NftCollection | null>(null);
  const [assets, setAssets] = useState<NftAssetSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [detail, setDetail] = useState<AssetDetailPayload | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Initial load: collection metadata + first page of assets
  useEffect(() => {
    let aborted = false;
    setLoading(true);
    setError(null);

    fetch(
      `/api/nft?collection=${collectionMint}&page=1&limit=${RAIL_PAGE_SIZE}`,
      { cache: "no-store" }
    )
      .then((r) => r.json())
      .then((json) => {
        if (aborted) return;
        if (!json?.success) {
          setError(json?.error ?? "load failed");
          setLoading(false);
          return;
        }
        setCollection(json.data.collection);
        setAssets(json.data.assets);
        setPage(1);
        setHasMore(
          json.data.assets.length === RAIL_PAGE_SIZE &&
            (json.data.collection.total_supply ?? 0) > RAIL_PAGE_SIZE
        );
        setLoading(false);
      })
      .catch((err) => {
        if (aborted) return;
        setError(err instanceof Error ? err.message : "network error");
        setLoading(false);
      });

    return () => {
      aborted = true;
    };
  }, [collectionMint]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(
        `/api/nft?collection=${collectionMint}&page=${nextPage}&limit=${RAIL_PAGE_SIZE}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (!json?.success) {
        setHasMore(false);
        return;
      }
      const newAssets = json.data.assets as NftAssetSummary[];
      setAssets((prev) => [...prev, ...newAssets]);
      setPage(nextPage);
      setHasMore(newAssets.length === RAIL_PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  }, [collectionMint, hasMore, loadingMore, page]);

  // Whenever selectedIndex changes (and we have an asset there), fetch detail
  useEffect(() => {
    const currentAsset = assets[selectedIndex];
    if (!currentAsset) return;
    let aborted = false;
    setDetailLoading(true);

    fetch(`/api/nft?asset=${currentAsset.id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (aborted) return;
        if (json?.success) setDetail(json.data);
        setDetailLoading(false);
      })
      .catch(() => {
        if (aborted) return;
        setDetailLoading(false);
      });

    return () => {
      aborted = true;
    };
  }, [selectedIndex, assets]);

  // "Other Owned" panel — only fetched when we have a session wallet
  const [otherOwned, setOtherOwned] = useState<{
    count: number;
    assets: NftAssetSummary[];
  } | null>(null);

  useEffect(() => {
    if (!sessionWallet) {
      setOtherOwned(null);
      return;
    }
    let aborted = false;
    fetch(
      `/api/nft?owner=${sessionWallet}&collection=${collectionMint}`,
      { cache: "no-store" }
    )
      .then((r) => r.json())
      .then((json) => {
        if (aborted) return;
        if (json?.success) setOtherOwned(json.data);
      })
      .catch(() => {});
    return () => {
      aborted = true;
    };
  }, [sessionWallet, collectionMint]);

  const selectIndex = useCallback(
    (i: number) => {
      if (i < 0 || i >= assets.length) return;
      setSelectedIndex(i);
    },
    [assets.length]
  );

  return {
    collection,
    assets,
    selectedIndex,
    selectIndex,
    detail,
    detailLoading,
    otherOwned,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
  };
}
