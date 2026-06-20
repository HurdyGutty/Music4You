import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SongPlaylistDialog from "@/components/dialogs/song-playlist-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getPlaylist, getPlaylistSongs, getSongs } from "@/services/music";

const SONGS_PAGE_SIZE = 6;

function getPaginationItems(currentPage, totalPages) {
    const pages = new Set(
        [1, totalPages, currentPage - 1, currentPage, currentPage + 1].filter(
            (page) => page >= 1 && page <= totalPages,
        ),
    );
    const sortedPages = Array.from(pages).sort((a, b) => a - b);
    const items = [];

    sortedPages.forEach((page, index) => {
        const previousPage = sortedPages[index - 1];

        if (previousPage && page - previousPage > 1) {
            items.push(`ellipsis-${previousPage}-${page}`);
        }

        items.push(page);
    });

    return items;
}

function formatDuration(durationSeconds) {
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function SongsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const playlistId = searchParams.get("playlist");
    const pageParam = Number(searchParams.get("page"));
    const currentPage =
        Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
    const [songs, setSongs] = useState([]);
    const [playlist, setPlaylist] = useState(null);
    const [meta, setMeta] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshVersion, setRefreshVersion] = useState(0);

    const goToPage = useCallback(
        (page) => {
            const nextParams = new URLSearchParams(searchParams);

            if (page <= 1) {
                nextParams.delete("page");
            } else {
                nextParams.set("page", String(page));
            }

            setSearchParams(nextParams);
        },
        [searchParams, setSearchParams],
    );

    const getPageHref = useCallback(
        (page) => {
            const nextParams = new URLSearchParams(searchParams);

            if (page <= 1) {
                nextParams.delete("page");
            } else {
                nextParams.set("page", String(page));
            }

            const query = nextParams.toString();

            return query ? `/songs?${query}` : "/songs";
        },
        [searchParams],
    );

    const refreshSongs = useCallback(() => {
        setRefreshVersion((currentVersion) => currentVersion + 1);
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function loadSongs() {
            try {
                setIsLoading(true);
                setError("");

                if (playlistId) {
                    const [playlistData, playlistSongs] = await Promise.all([
                        getPlaylist(playlistId),
                        getPlaylistSongs(playlistId),
                    ]);

                    if (isMounted) {
                        const totalPages =
                            Math.ceil(playlistSongs.length / SONGS_PAGE_SIZE) || 1;

                        if (currentPage > totalPages) {
                            goToPage(totalPages);
                            return;
                        }

                        setPlaylist(playlistData);
                        setSongs(playlistSongs);
                        setMeta({
                            total: playlistSongs.length,
                            page: currentPage,
                            limit: SONGS_PAGE_SIZE,
                            totalPages,
                        });
                    }

                    return;
                }

                const result = await getSongs({
                    q: searchParams.get("q") || "",
                    page: currentPage,
                    limit: SONGS_PAGE_SIZE,
                });

                if (isMounted) {
                    const totalPages = Math.max(Number(result.meta?.totalPages) || 1, 1);

                    if (currentPage > totalPages) {
                        goToPage(totalPages);
                        return;
                    }

                    setPlaylist(null);
                    setSongs(result.songs);
                    setMeta(result.meta);
                }
            } catch (error) {
                if (isMounted) {
                    setError(error.message);
                    setSongs([]);
                    setPlaylist(null);
                    setMeta(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadSongs();

        return () => {
            isMounted = false;
        };
    }, [playlistId, currentPage, goToPage, refreshVersion]);

    const totalSongs = meta?.total ?? songs.length;
    const totalPages = Math.max(Number(meta?.totalPages) || 1, 1);
    const firstRowIndex = (currentPage - 1) * SONGS_PAGE_SIZE;
    const visibleSongs = playlist
        ? songs.slice(firstRowIndex, firstRowIndex + SONGS_PAGE_SIZE)
        : songs;
    const visibleStart = totalSongs === 0 ? 0 : firstRowIndex + 1;
    const visibleEnd = Math.min(firstRowIndex + visibleSongs.length, totalSongs);
    const title = playlist ? playlist.name : "Danh sách bài hát";
    const description =
        playlist?.description || "Các bài hát đang có trong hệ thống.";
    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages;
    const paginationItems = getPaginationItems(currentPage, totalPages);

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                    <p className="text-muted-foreground">{description}</p>
                </div>
                <span className="text-sm text-muted-foreground">
                    {totalSongs} bài hát
                </span>
            </div>

            <div className="rounded-lg border">
                <Table>
                    <TableCaption>
                        {playlist
                            ? "Các bài hát trong playlist này."
                            : "Tất cả bài hát trong hệ thống."}
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead>Tên bài hát</TableHead>
                            <TableHead>Nghệ sĩ</TableHead>
                            <TableHead>Thể loại</TableHead>
                            <TableHead className="text-right">Thời lượng</TableHead>
                            <TableHead className="w-40 text-right">Playlist</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading
                            ? Array.from({ length: 6 }).map((_, index) => (
                                  <TableRow key={index}>
                                      <TableCell>
                                          <Skeleton className="h-4 w-6" />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton className="h-4 w-48" />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton className="h-4 w-40" />
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton className="h-4 w-24" />
                                      </TableCell>
                                      <TableCell className="text-right">
                                          <Skeleton className="ml-auto h-4 w-12" />
                                      </TableCell>
                                      <TableCell className="text-right">
                                          <Skeleton className="ml-auto h-8 w-16" />
                                      </TableCell>
                                  </TableRow>
                              ))
                            : error ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-destructive"
                                    >
                                        {error}
                                    </TableCell>
                                </TableRow>
                            ) 
                            : songs.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Không có bài hát nào.
                                </TableCell>
                            </TableRow>
                        ) : null}
                        {!isLoading && !error
                            ? visibleSongs.map((song, index) => (
                                  <TableRow key={song.id}>
                                      <TableCell className="font-medium">
                                          {firstRowIndex + index + 1}
                                      </TableCell>
                                      <TableCell>{song.title}</TableCell>
                                      <TableCell>{song.artist}</TableCell>
                                      <TableCell>{song.genre || "-"}</TableCell>
                                      <TableCell className="text-right tabular-nums">
                                          {formatDuration(song.duration_seconds)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                          <SongPlaylistDialog
                                              song={song}
                                              onSaved={refreshSongs}
                                          />
                                      </TableCell>
                                  </TableRow>
                              ))
                            : null}
                    </TableBody>
                </Table>
                <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Hiển thị {visibleStart}-{visibleEnd} trong {totalSongs} bài hát
                    </p>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <span className="text-sm text-muted-foreground">
                            Trang {currentPage} / {totalPages}
                        </span>
                        <Pagination className="w-auto">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={getPageHref(currentPage - 1)}
                                        text="Trước"
                                        aria-disabled={isLoading || !canGoPrevious}
                                        tabIndex={
                                            isLoading || !canGoPrevious ? -1 : undefined
                                        }
                                        className={
                                            isLoading || !canGoPrevious
                                                ? "pointer-events-none opacity-50"
                                                : ""
                                        }
                                        onClick={(event) => {
                                            event.preventDefault();

                                            if (canGoPrevious) {
                                                goToPage(currentPage - 1);
                                            }
                                        }}
                                    />
                                </PaginationItem>
                                {paginationItems.map((item) => (
                                    <PaginationItem key={item}>
                                        {typeof item === "number" ? (
                                            <PaginationLink
                                                href={getPageHref(item)}
                                                isActive={item === currentPage}
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    goToPage(item);
                                                }}
                                            >
                                                {item}
                                            </PaginationLink>
                                        ) : (
                                            <PaginationEllipsis />
                                        )}
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        href={getPageHref(currentPage + 1)}
                                        text="Sau"
                                        aria-disabled={isLoading || !canGoNext}
                                        tabIndex={isLoading || !canGoNext ? -1 : undefined}
                                        className={
                                            isLoading || !canGoNext
                                                ? "pointer-events-none opacity-50"
                                                : ""
                                        }
                                        onClick={(event) => {
                                            event.preventDefault();

                                            if (canGoNext) {
                                                goToPage(currentPage + 1);
                                            }
                                        }}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            </div>
        </section>
    );
}