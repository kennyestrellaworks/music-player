export const sortPlaylistByReleasedYear = (playlist = []) => {
  const safePlaylist = Array.isArray(playlist) ? playlist : [];
  const getReleasedYear = (song) => {
    const year = song?.releasedYear;

    if (typeof year === "string" && !year.trim()) {
      return Number.NEGATIVE_INFINITY;
    }

    const numericYear = Number(year);
    return Number.isFinite(numericYear)
      ? numericYear
      : Number.NEGATIVE_INFINITY;
  };

  return [...safePlaylist].sort(
    (firstSong, secondSong) =>
      getReleasedYear(secondSong) - getReleasedYear(firstSong),
  );
};

export const getFilteredPlaylist = (playlist = [], searchQuery = "") => {
  const normalizedQuery = String(searchQuery).trim().toLowerCase();
  const safePlaylist = Array.isArray(playlist) ? playlist : [];

  if (!normalizedQuery) {
    return safePlaylist;
  }

  return safePlaylist.filter((song) => {
    if (!song || typeof song !== "object") {
      return false;
    }

    const haystack =
      `${song.title ?? ""} ${song.artist ?? ""} ${song.url ?? ""}`.toLowerCase();

    return haystack.includes(normalizedQuery);
  });
};

export const getNextSong = (playlist = [], currentSong, direction = 1) => {
  if (!Array.isArray(playlist) || playlist.length === 0) {
    return null;
  }

  const currentIndex = playlist.findIndex((song) => {
    if (!song || !currentSong) {
      return false;
    }

    return (
      song._id === currentSong._id ||
      (song.url && currentSong.url && song.url === currentSong.url)
    );
  });

  if (currentIndex === -1) {
    return playlist[0];
  }

  const nextIndex =
    (currentIndex + direction + playlist.length) % playlist.length;

  return playlist[nextIndex];
};
