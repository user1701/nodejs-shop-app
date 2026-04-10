interface PageInfo {
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
    currentPage: number;
    perPage: number;
}

export function getPageInfo(currentPage: number, perPage: number, totalItems: number): PageInfo {
    if (totalItems < 0) throw new Error("totalItems must be non-negative");
    if (perPage <= 0) throw new Error("perPage must be greater than zero");

    const totalPages = Math.ceil(totalItems / perPage);

    if (currentPage < 1 || currentPage > totalPages) {
        throw new Error(`Page ${currentPage} is out of range (1-${totalPages})`);
    }

    return {
        perPage,
        totalItems,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        currentPage,
        nextPage: currentPage < totalPages ? currentPage + 1 : null,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
    };
}
