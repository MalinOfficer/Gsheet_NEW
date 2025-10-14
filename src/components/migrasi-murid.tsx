

"use client";

import { useState, useCallback, KeyboardEvent, MouseEvent, useMemo, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { PlusCircle, Wand2, Download, Undo2, Redo2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useVirtualizer } from '@tanstack/react-virtual';


const tableHeaders = [
    "No", "Username", "NIS", "NISN", "NIK", "Kode", "Asal Sekolah", "Nama", "L/P",
    "Tempat Lahir", "Tanggal Lahir", "Handphone", "Telepon", "Email", "Alamat",
    "No Rumah", "RT", "RW", "Ayah", "Pekerjaan Ayah", "Ibu", "Pekerjaan Ibu",
    "Wali", "Pekerjaan Wali", "No Kartu Keluarga"
];

type MuridData = Record<string, string | number>;
type CellSelection = {
    row: number;
    col: number;
};

// Helper to create an empty row
const createEmptyRow = (): MuridData => tableHeaders.reduce((acc, header) => ({ ...acc, [header]: '' }), {});

const INITIAL_ROWS = 23;

const monthMap: { [key: string]: string } = {
    'januari': '01', 'janu': '01', 'jan': '01',
    'februari': '02', 'feb': '02', 'febr': '02',
    'maret': '03', 'mar': '03',
    'april': '04', 'apr': '04',
    'mei': '05',
    'juni': '06', 'jun': '06',
    'juli': '07', 'jul': '07',
    'agustus': '08', 'agu': '08', 'ags': '08',
    'september': '09', 'sep': '09', 'sept': '09',
    'oktober': '10', 'okt': '10', 'oct': '10',
    'november': '11', 'nov': '11',
    'desember': '12', 'des': '12',
};

const parseAndFormatDate = (dateStr: string): string | null => {
    if (!dateStr || typeof dateStr !== 'string') return null;

    const trimmedDate = dateStr.trim().toLowerCase();
    
    // Check if it's already in DD/MM/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmedDate)) {
        const parts = trimmedDate.split('/');
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        // Handle potential MM/DD/YYYY to DD/MM/YYYY swap
        if (parseInt(month, 10) > 12) {
             return `${parts[1].padStart(2, '0')}/${parts[0].padStart(2, '0')}/${parts[2]}`;
        }
        return `${day}/${month}/${parts[2]}`;
    }

    // Try parsing MM/DD/YYYY or M/D/YYYY
    const americanDateMatch = trimmedDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (americanDateMatch) {
        const month = americanDateMatch[1].padStart(2, '0');
        const day = americanDateMatch[2].padStart(2, '0');
        const year = americanDateMatch[3];
        return `${day}/${month}/${year}`;
    }

    // Try parsing DD-MonthName-YYYY (e.g., 03-Januari-2009) or MonthName DD YYYY
    const datePartsMatch = trimmedDate.match(/^(?:(\d{1,2})[-.\s])?([a-zA-Z]+)[-.\s](\d{1,2})?[-.\s](\d{4})$/);
    if (datePartsMatch) {
        const potentialDay1 = datePartsMatch[1];
        const monthName = datePartsMatch[2];
        const potentialDay2 = datePartsMatch[3];
        const year = datePartsMatch[4];

        const day = (potentialDay1 || potentialDay2)?.padStart(2, '0');
        
        let month: string | undefined = undefined;
        // Find a matching month prefix
        for (const key in monthMap) {
            if (monthName.startsWith(key)) {
                month = monthMap[key];
                break;
            }
        }

        if (day && month && year) {
            return `${day}/${month}/${year}`;
        }
    }
    
    // Try parsing YYYY-MM-DD
    const isoMatch = trimmedDate.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
    if (isoMatch) {
        const year = isoMatch[1];
        const month = isoMatch[2];
        const day = isoMatch[3];
        return `${day}/${month}/${year}`;
    }

    // Try parsing MonthName DD YYYY (e.g., januari 21 2000)
    const monthFirstMatch = trimmedDate.match(/^([a-zA-Z]+)\s(\d{1,2})\s(\d{4})$/);
    if (monthFirstMatch) {
        const monthName = monthFirstMatch[1];
        const day = monthFirstMatch[2].padStart(2, '0');
        const year = monthFirstMatch[3];
        
        let month: string | undefined = undefined;
        for (const key in monthMap) {
            if (monthName.startsWith(key)) {
                month = monthMap[key];
                break;
            }
        }

        if (day && month && year) {
            return `${day}/${month}/${year}`;
        }
    }

    return null; // Return null if no format matches
};


export function MigrasiMurid() {
    const [rows, setRows] = useState<MuridData[]>(() => Array.from({ length: INITIAL_ROWS }, (_, i) => createEmptyRow()));
    const [selectedRange, setSelectedRange] = useState<{ start: CellSelection | null, end: CellSelection | null }>({ start: null, end: null });
    const [numRowsToAdd, setNumRowsToAdd] = useState<number | string>(1);
    const { toast } = useToast();
    const isSelecting = useRef(false);
    
    const [isDraggingFill, setIsDraggingFill] = useState(false);
    const [fillRange, setFillRange] = useState<{ start: CellSelection, end: CellSelection } | null>(null);

    const [history, setHistory] = useState<MuridData[][]>([rows]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const tableContainerRef = useRef<HTMLDivElement>(null);
    

    const recordHistory = (newRows: MuridData[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, newRows]);
        setHistoryIndex(newHistory.length);
    };
    
    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setRows(history[newIndex]);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setRows(history[newIndex]);
        }
    };

    const handleRowsChange = (newRows: MuridData[], record: boolean = true) => {
        setRows(newRows);
        if (record) {
            recordHistory(newRows);
        }
    };
    
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
        const initialWidths: Record<string, number> = {};
        tableHeaders.forEach(header => {
            if (header === "No") initialWidths[header] = 50;
            else if (header === "Nama") initialWidths[header] = 200;
            else initialWidths[header] = 120; // default width
        });
        return initialWidths;
    });

    const isResizing = useRef<string | null>(null);
    const startX = useRef(0);
    const startWidth = useRef(0);

    const handleResizeMouseDown = (header: string, e: MouseEvent) => {
        isResizing.current = header;
        startX.current = e.clientX;
        startWidth.current = columnWidths[header];
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', handleResizeMouseMove);
        window.addEventListener('mouseup', handleResizeMouseUp);
    };

    const handleResizeMouseMove = useCallback((e: globalThis.MouseEvent) => {
        if (!isResizing.current) return;
        const currentWidth = startWidth.current + e.clientX - startX.current;
        setColumnWidths(prev => ({
            ...prev,
            [isResizing.current as string]: Math.max(40, currentWidth) // Minimum width 40px
        }));
    }, []);

    const handleResizeMouseUp = useCallback(() => {
        isResizing.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', handleResizeMouseMove);
        window.removeEventListener('mouseup', handleResizeMouseUp);
    }, [handleResizeMouseMove]);

    const handleCellChange = (rowIndex: number, header: string, value: string) => {
        const newRows = [...rows];
        newRows[rowIndex] = { ...newRows[rowIndex], [header]: value };
        handleRowsChange(newRows);
    };
    
    const getNormalizedRange = useCallback((range: { start: CellSelection | null, end: CellSelection | null }) => {
        if (!range.start) {
            return { startRow: -1, endRow: -1, startCol: -1, endCol: -1 };
        }
        const end = range.end || range.start;
        const startRow = Math.min(range.start.row, end.row);
        const endRow = Math.max(range.start.row, end.row);
        const startCol = Math.min(range.start.col, end.col);
        const endCol = Math.max(range.start.col, end.col);
        return { startRow, endRow, startCol, endCol };
    }, []);
    
    const normalizedSelectedRange = useMemo(() => getNormalizedRange(selectedRange), [selectedRange, getNormalizedRange]);
    const normalizedFillRange = useMemo(() => getNormalizedRange(fillRange || { start: null, end: null }), [fillRange, getNormalizedRange]);


    const isCellSelected = useCallback((row: number, col: number) => {
        if (!selectedRange.start) return false;
        const { startRow, endRow, startCol, endCol } = normalizedSelectedRange;
        return row >= startRow && row <= endRow && col >= startCol && col <= endCol;
    }, [normalizedSelectedRange, selectedRange.start]);
    
    const isCellInFillRange = useCallback((row: number, col: number) => {
        if (!isDraggingFill || !fillRange?.start) return false;
        const { startRow, endRow, startCol, endCol } = normalizedFillRange;
        return row >= startRow && row <= endRow && col >= startCol && col <= endCol;
    }, [isDraggingFill, fillRange, normalizedFillRange]);

    const handleClearSelectedCells = () => {
         if (!selectedRange.start) return;
        const newRows = [...rows];
        const { startRow, endRow, startCol, endCol } = normalizedSelectedRange;
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const header = tableHeaders[c];
                if (header !== "No") {
                  newRows[r] = { ...newRows[r], [header]: '' };
                }
            }
        }
        handleRowsChange(newRows);
    };


    const handleCopy = useCallback(() => {
        if (!selectedRange.start) {
            return;
        }

        const { startRow, endRow, startCol, endCol } = normalizedSelectedRange;
        
        let copyString = "";
        for (let r = startRow; r <= endRow; r++) {
            const rowValues = [];
            for (let c = startCol; c <= endCol; c++) {
                const header = tableHeaders[c];
                rowValues.push(rows[r][header] || "");
            }
            copyString += rowValues.join("\t");
            if (r < endRow) {
                copyString += "\n";
            }
        }

        navigator.clipboard.writeText(copyString).then(() => {
            toast({
                title: "Copied to Clipboard",
                description: `Selected data has been copied.`,
            });
        }, () => {
            toast({
                variant: "destructive",
                title: "Copy Failed",
                description: "Could not copy data to clipboard.",
            });
        });
    }, [rows, normalizedSelectedRange, toast, selectedRange]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, { row, col }: CellSelection) => {
        const move = (dRow: number, dCol: number) => {
            e.preventDefault();
            const nextRow = Math.max(0, Math.min(rows.length - 1, row + dRow));
            const nextCol = Math.max(1, Math.min(tableHeaders.length - 1, col + dCol)); // skip "No" column
            const nextCell = document.querySelector(`[data-row='${nextRow}'][data-col='${nextCol}']`) as HTMLInputElement;
            if (nextCell) {
                nextCell.focus();
                setSelectedRange({ start: { row: nextRow, col: nextCol }, end: { row: nextRow, col: nextCol } });
            }
        };

        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            e.preventDefault();
            handleCopy();
            return;
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            handleUndo();
            return;
        }

        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'Z' && e.shiftKey))) {
            e.preventDefault();
            handleRedo();
            return;
        }

        switch (e.key) {
            case "ArrowUp":    move(-1, 0); break;
            case "ArrowDown":  move(1, 0);  break;
            case "ArrowLeft":  move(0, -1); break;
            case "ArrowRight": move(0, 1);  break;
            case "Tab":
                e.preventDefault();
                move(0, e.shiftKey ? -1 : 1);
                break;
            case "Delete":
            case "Backspace":
                if (selectedRange.start && (normalizedSelectedRange.startRow !== normalizedSelectedRange.endRow || normalizedSelectedRange.startCol !== normalizedSelectedRange.endCol)) {
                    e.preventDefault();
                    handleClearSelectedCells();
                }
                break;
        }
    };
    
    const handleMouseDown = (e: MouseEvent<HTMLInputElement>, { row, col }: CellSelection) => {
        if (isResizing.current) return;
        if (tableHeaders[col] === "No") return;
        isSelecting.current = true;
        if (e.shiftKey && selectedRange.start) {
            setSelectedRange(prev => ({ ...prev, end: { row, col } }));
        } else {
            setSelectedRange({ start: { row, col }, end: { row, col } });
        }
    };

    const handleMouseOver = (e: MouseEvent<HTMLInputElement>, { row, col }: CellSelection) => {
        if (isSelecting.current) {
            e.preventDefault();
            if (tableHeaders[col] === "No") return;
            setSelectedRange(prev => ({ ...prev, end: { row, col } }));
        } else if (isDraggingFill) {
            const { startRow, endRow, startCol: selStartCol, endCol: selEndCol } = normalizedSelectedRange;
            let newFillEnd: CellSelection;
            // Determine drag direction
            if (Math.abs(row - endRow) > Math.abs(col - selEndCol)) { // Vertical drag
                 newFillEnd = { row: row, col: selEndCol };
                 setFillRange({ start: { row: startRow, col: selStartCol }, end: newFillEnd });
            } else { // Horizontal drag
                 newFillEnd = { row: endRow, col: col };
                 setFillRange({ start: { row: startRow, col: selStartCol }, end: newFillEnd });
            }
        }
    };
    
    const handleMouseUp = () => {
        if (isSelecting.current) {
            isSelecting.current = false;
        }
        if (isDraggingFill) {
            // Apply the fill
            if (fillRange) {
                const { startRow: selStartRow, endRow: selEndRow, startCol: selStartCol, endCol: selEndCol } = normalizedSelectedRange;
                const { startRow: fillStartRow, endRow: fillEndRow, startCol: fillStartCol, endCol: fillEndCol } = normalizedFillRange;

                let newRows = [...rows];
                const sourceData = [];
                for (let r = selStartRow; r <= selEndRow; r++) {
                    const rowData = [];
                    for (let c = selStartCol; c <= selEndCol; c++) {
                        rowData.push(newRows[r][tableHeaders[c]]);
                    }
                    sourceData.push(rowData);
                }

                for (let r = fillStartRow; r <= fillEndRow; r++) {
                    for (let c = fillStartCol; c <= fillEndCol; c++) {
                        if (r < selStartRow || r > selEndRow || c < selStartCol || c > selEndCol) { // Don't overwrite source
                            const sourceRow = sourceData[(r - fillStartRow) % sourceData.length];
                            const sourceValue = sourceRow[(c - fillStartCol) % sourceRow.length];
                            newRows[r] = { ...newRows[r], [tableHeaders[c]]: sourceValue };
                        }
                    }
                }
                handleRowsChange(newRows);
            }
            setIsDraggingFill(false);
            setFillRange(null);
        }
    };

    const handlePaste = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
        event.preventDefault();
        const startCell = selectedRange.start;
        if (!startCell) {
            toast({
                variant: "destructive",
                title: "No Cell Selected",
                description: "Please click a cell to select where to paste data."
            });
            return;
        }

        const pasteData = event.clipboardData.getData("text");
        const pastedLines = pasteData.trim().split('\n');
        if (pastedLines.length === 0) return;

        let newRows = [...rows];
        let changes = 0;
        const dateHeader = "Tanggal Lahir";
        
        const requiredRowCount = startCell.row + pastedLines.length;
        if (requiredRowCount > newRows.length) {
            const rowsToAdd = requiredRowCount - newRows.length;
            newRows = [...newRows, ...Array.from({ length: rowsToAdd }, createEmptyRow)];
        }

        pastedLines.forEach((line, lineIndex) => {
            const rowIndex = startCell.row + lineIndex;
            let updatedRow = { ...newRows[rowIndex] };

            const values = line.split('\t');
            values.forEach((value, valueIndex) => {
                const colIndex = startCell.col + valueIndex;
                if (colIndex >= tableHeaders.length) return;

                const header = tableHeaders[colIndex];
                if (header !== "No") {
                    updatedRow[header] = value.trim();
                }
            });

            const originalDate = updatedRow[dateHeader];
            if (originalDate && typeof originalDate === 'string') {
                const formattedDate = parseAndFormatDate(originalDate);
                if (formattedDate && formattedDate !== originalDate) {
                    updatedRow[dateHeader] = formattedDate;
                    changes++;
                }
            }
            newRows[rowIndex] = updatedRow;
        });

        handleRowsChange(newRows);
        toast({
            title: "Data Pasted!",
            description: `${pastedLines.length} rows of data have been pasted.`,
        });

        if (changes > 0) {
            toast({
                title: "Dates Auto-Formatted",
                description: `Automatically formatted ${changes} dates to DD/MM/YYYY.`,
            });
        }
    }, [selectedRange.start, toast, rows, handleRowsChange]);

    const handleAddRows = () => {
        const count = Number(numRowsToAdd) || 1;
        if (isNaN(count) || count < 1) {
            toast({ variant: 'destructive', title: 'Invalid Number', description: 'Please enter a valid number of rows to add.' });
            return;
        }
        const newRows = [...rows, ...Array.from({ length: count }, createEmptyRow)];
        handleRowsChange(newRows);
        toast({ title: "Rows Added", description: `${count} empty rows have been added.` });
    };

    const handleFormatDates = () => {
        let changes = 0;
        const dateHeader = "Tanggal Lahir";
        
        const newRows = rows.map(row => {
            const originalValue = row[dateHeader];
            if (originalValue && typeof originalValue === 'string') {
                const formattedValue = parseAndFormatDate(originalValue);
                if (formattedValue && formattedValue !== originalValue) {
                    changes++;
                    return { ...row, [dateHeader]: formattedValue };
                }
            }
            return row;
        });

        if (changes > 0) {
            handleRowsChange(newRows);
            toast({
                title: "Dates Formatted",
                description: `Successfully formatted ${changes} dates to DD/MM/YYYY.`,
            });
        } else {
            toast({
                variant: "default",
                title: "No Dates to Format",
                description: "No dates needed reformatting or the format was not recognized.",
            });
        }
    };
    
    const handleExportExcel = () => {
        if (typeof XLSX === 'undefined') {
            toast({ variant: 'destructive', title: "Library Not Loaded", description: "The Excel library is still loading. Please try again in a moment."});
            return;
        }
        
        const processedRows = rows
            .filter((row) => row["Username"])
            .map((row, index) => {
                const newRow: Record<string, any> = {...row};
                newRow["No"] = index + 1;
                return newRow;
            });

        if (processedRows.length === 0) {
            toast({
                variant: "destructive",
                title: "No Data to Export",
                description: "The table is empty or no rows have a username. Please add some data before exporting.",
            });
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(processedRows, { header: tableHeaders, skipHeader: false, cellDates: true });
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Murid");
        
        const date = new Date().toISOString().slice(0, 10);
        const filename = `Data_Murid_${date}.xls`;

        XLSX.writeFile(workbook, filename, { bookType: "biff8" });
        
        toast({
            title: "Export Successful",
            description: `${processedRows.length} rows have been exported to ${filename}.`,
        });
    };

    const handleClearTable = () => {
        const newRows = Array.from({ length: INITIAL_ROWS }, (_, i) => createEmptyRow());
        handleRowsChange(newRows);
        toast({ title: "Table Cleared", description: "All data has been cleared from the table." });
    };

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => 28, // Corresponds to h-7
        overscan: 5,
    });
    
    const virtualRows = rowVirtualizer.getVirtualItems();
    const totalHeight = rowVirtualizer.getTotalSize();
    
    const getRowNumberValue = (row: MuridData, index: number) => {
        return (row["Username"] || index === 0) ? String(index + 1) : "";
    };

    const handleFillHandleMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFill(true);
        if (selectedRange.start) {
            setFillRange({ start: selectedRange.start, end: selectedRange.end || selectedRange.start });
        }
    };


    return (
        <div className="h-full flex flex-col bg-background" onMouseUp={handleMouseUp} onPaste={handlePaste}>
            <div className="flex-shrink-0 p-4 border-b">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Data Murid</h1>
                        <p className="text-sm text-muted-foreground mt-1">Input dan format data migrasi siswa seperti menggunakan spreadsheet.</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button onClick={handleUndo} size="sm" variant="outline" disabled={historyIndex === 0}>
                            <Undo2 className="mr-2 h-4 w-4" /> Undo
                        </Button>
                        <Button onClick={handleRedo} size="sm" variant="outline" disabled={historyIndex === history.length - 1}>
                            <Redo2 className="mr-2 h-4 w-4" /> Redo
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete All
                            </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action will permanently delete all data from the table. You cannot undo this action.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearTable}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button
                            onClick={handleExportExcel}
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-700"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-grow overflow-auto" ref={tableContainerRef}>
                 <div 
                    style={{ 
                        width: `${tableHeaders.reduce((acc, h) => acc + columnWidths[h], 0)}px`,
                        height: `${totalHeight + 36}px`,
                        position: 'relative',
                    }}
                >
                    <div className="sticky top-0 z-20 flex bg-secondary" style={{height: '36px'}}>
                        {tableHeaders.map((header) => (
                            <div
                                key={header}
                                style={{ width: columnWidths[header] }}
                                className="relative select-none border-r border-b px-2 py-2 flex items-center justify-center font-semibold text-xs text-foreground"
                            >
                                <span className="truncate">{header}</span>
                                {header === "Tanggal Lahir" && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                                                <Wand2 className="h-3 w-3" />
                                                <span className="sr-only">Format Menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={handleFormatDates}>
                                                Format ke DD/MM/YYYY
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                                <div
                                    onMouseDown={(e: MouseEvent) => handleResizeMouseDown(header, e)}
                                    className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize z-10"
                                />
                            </div>
                        ))}
                    </div>
                    
                    <div style={{ paddingTop: '36px', height: totalHeight, position: 'relative' }}>
                        {virtualRows.map(virtualRow => {
                            const row = rows[virtualRow.index];
                            return (
                                <div
                                    key={virtualRow.key}
                                    className="flex absolute top-0 left-0"
                                    style={{
                                        width: '100%',
                                        height: `${virtualRow.size}px`,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                >
                                    {tableHeaders.map((header, colIndex) => {
                                        const isSelected = isCellSelected(virtualRow.index, colIndex);
                                        const isFillPreviewing = isDraggingFill && isCellInFillRange(virtualRow.index, colIndex) && !isSelected;
                                        const isBottomRightCell = selectedRange.start && normalizedSelectedRange.endRow === virtualRow.index && normalizedSelectedRange.endCol === colIndex;
                                        
                                        return (
                                            <div
                                                key={`${virtualRow.index}-${colIndex}`}
                                                style={{ width: columnWidths[header] }}
                                                className={cn("p-0 m-0 border-r border-b relative flex items-center")}
                                            >
                                                <Input
                                                    type="text"
                                                    value={header === "No" ? getRowNumberValue(row, virtualRow.index) : String(row[header] || "")}
                                                    readOnly={header === "No"}
                                                    onChange={(e) => handleCellChange(virtualRow.index, header, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, { row: virtualRow.index, col: colIndex })}
                                                    onMouseDown={(e) => handleMouseDown(e, { row: virtualRow.index, col: colIndex })}
                                                    onMouseOver={(e) => handleMouseOver(e, { row: virtualRow.index, col: colIndex })}
                                                    data-row={virtualRow.index}
                                                    data-col={colIndex}
                                                    className={cn(
                                                        "w-full h-7 text-xs px-1 rounded-none border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary z-10 relative",
                                                        header === "No" && "text-center cursor-default bg-muted/30 focus-visible:ring-0",
                                                        isSelected && "bg-blue-100/50 dark:bg-blue-900/50",
                                                        isFillPreviewing && "bg-green-200/50 dark:bg-green-900/50"
                                                    )}
                                                />
                                                {isSelected && <div className="absolute inset-0 border-2 border-primary pointer-events-none z-10" />}
                                                {isBottomRightCell && !isDraggingFill && (
                                                    <div 
                                                        onMouseDown={handleFillHandleMouseDown}
                                                        className="absolute -bottom-1 -right-1 h-2 w-2 bg-primary cursor-crosshair z-20 border border-background"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>


            <div className="flex-shrink-0 p-2 border-t">
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        value={numRowsToAdd}
                        onChange={(e) => {
                            setNumRowsToAdd(e.target.value);
                        }}
                        placeholder=""
                        className="w-24 h-9"
                    />
                    <Button onClick={handleAddRows} size="sm" variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Baris
                    </Button>
                </div>
            </div>
        </div>
    );
}

    

    

    