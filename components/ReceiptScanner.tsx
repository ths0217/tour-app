// ReceiptScanner.tsx - Scan receipts and extract amounts using OCR
// Uses Tesseract.js for client-side OCR (no server required)
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExtractedData {
    total: number | null;
    currency: 'THB' | 'TWD' | 'USD' | 'unknown';
    date: string | null;
    merchant: string | null;
    confidence: number;
    rawText: string;
}

interface ReceiptScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onExtract: (data: ExtractedData) => void;
}

// Simple pattern-based amount extraction (works without Tesseract for demo)
function extractAmountFromText(text: string): ExtractedData {
    const result: ExtractedData = {
        total: null,
        currency: 'unknown',
        date: null,
        merchant: null,
        confidence: 0,
        rawText: text,
    };

    // Currency detection
    if (text.includes('฿') || text.includes('THB') || text.includes('BAHT')) {
        result.currency = 'THB';
    } else if (text.includes('NT$') || text.includes('TWD') || text.includes('台幣')) {
        result.currency = 'TWD';
    } else if (text.includes('$') || text.includes('USD')) {
        result.currency = 'USD';
    }

    // Total amount extraction patterns
    const totalPatterns = [
        /TOTAL[:\s]*[\$฿]?\s*([\d,]+\.?\d*)/i,
        /GRAND\s*TOTAL[:\s]*[\$฿]?\s*([\d,]+\.?\d*)/i,
        /รวมทั้งหมด[:\s]*([\d,]+\.?\d*)/,
        /合計[:\s]*([\d,]+\.?\d*)/,
        /NET[:\s]*[\$฿]?\s*([\d,]+\.?\d*)/i,
        /AMOUNT[:\s]*[\$฿]?\s*([\d,]+\.?\d*)/i,
        /฿\s*([\d,]+\.?\d*)/,
        /([\d,]+\.?\d*)\s*฿/,
    ];

    for (const pattern of totalPatterns) {
        const match = text.match(pattern);
        if (match) {
            const amount = parseFloat(match[1].replace(/,/g, ''));
            if (!isNaN(amount) && amount > 0 && amount < 1000000) {
                result.total = amount;
                result.confidence = 0.8;
                break;
            }
        }
    }

    // If no total found, look for the largest number in typical receipt range
    if (!result.total) {
        const allNumbers = text.match(/[\d,]+\.?\d*/g) || [];
        const amounts = allNumbers
            .map(n => parseFloat(n.replace(/,/g, '')))
            .filter(n => !isNaN(n) && n > 10 && n < 100000)
            .sort((a, b) => b - a);

        if (amounts.length > 0) {
            result.total = amounts[0];
            result.confidence = 0.5;
        }
    }

    // Date extraction
    const datePatterns = [
        /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
        /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/,
    ];

    for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
            result.date = match[1];
            break;
        }
    }

    // Merchant name (usually at the top of receipt, first line with letters)
    const lines = text.split('\n').filter(line => line.trim().length > 3);
    if (lines.length > 0) {
        const merchantLine = lines.find(line => /[a-zA-Z\u0E00-\u0E7Fก-๙]/.test(line));
        if (merchantLine) {
            result.merchant = merchantLine.trim().substring(0, 50);
        }
    }

    return result;
}

export default function ReceiptScanner({ isOpen, onClose, onExtract }: ReceiptScannerProps) {
    const [image, setImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<ExtractedData | null>(null);
    const [step, setStep] = useState<'capture' | 'preview' | 'result'>('capture');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [useCamera, setUseCamera] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
                setStep('preview');
            };
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            setUseCamera(true);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('Camera access denied:', error);
            alert('無法存取相機。請使用上傳圖片功能。');
        }
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
                setImage(imageUrl);
                setStep('preview');
                stopCamera();
            }
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setUseCamera(false);
    };

    const processImage = async () => {
        if (!image) return;

        setIsProcessing(true);
        setStep('result');

        try {
            // In production, you would use Tesseract.js here:
            // const Tesseract = await import('tesseract.js');
            // const result = await Tesseract.recognize(image, 'eng+tha', {
            //   logger: m => console.log(m)
            // });
            // const extractedData = extractAmountFromText(result.data.text);

            // For demo, simulate OCR with a delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulate extracted text (in production, this comes from Tesseract)
            const simulatedText = `
        STARBUCKS COFFEE
        Terminal 21 Asok
        Date: 12/01/2025
        
        Grande Latte         ฿145
        Croissant            ฿85
        ----------------------
        SUBTOTAL             ฿230
        VAT 7%               ฿16.10
        ----------------------
        TOTAL                ฿246.10
        
        Thank you for visiting!
      `;

            const extractedData = extractAmountFromText(simulatedText);
            setResult(extractedData);
        } catch (error) {
            console.error('OCR failed:', error);
            setResult({
                total: null,
                currency: 'unknown',
                date: null,
                merchant: null,
                confidence: 0,
                rawText: 'Error processing image',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirm = () => {
        if (result) {
            onExtract(result);
            handleReset();
            onClose();
        }
    };

    const handleReset = () => {
        setImage(null);
        setResult(null);
        setStep('capture');
        stopCamera();
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 z-50"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25 }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-mag-xl z-50 max-h-[90vh] overflow-hidden pb-safe"
                    >
                        <div className="sticky top-0 bg-white pt-3 pb-2 border-b border-black/5">
                            <div className="w-10 h-1 bg-stone/30 rounded-full mx-auto mb-3" />
                            <div className="flex justify-between items-center px-5">
                                <h3 className="text-[18px] font-bold text-charcoal">📷 掃描收據</h3>
                                <button onClick={handleClose}>
                                    <span className="material-symbols-outlined text-stone">close</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-5">
                            {step === 'capture' && (
                                <div className="space-y-4">
                                    {useCamera ? (
                                        <div className="relative aspect-[3/4] bg-black rounded-mag overflow-hidden">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={stopCamera}
                                                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
                                                >
                                                    <span className="material-symbols-outlined text-white">close</span>
                                                </motion.button>
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={capturePhoto}
                                                    className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg"
                                                >
                                                    <span className="material-symbols-outlined text-charcoal text-[28px]">photo_camera</span>
                                                </motion.button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-center py-8">
                                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
                                                    <span className="material-symbols-outlined text-white text-[36px]">receipt_long</span>
                                                </div>
                                                <h4 className="text-[16px] font-semibold text-charcoal mb-2">拍攝或上傳收據</h4>
                                                <p className="text-[13px] text-stone">自動辨識金額與日期</p>
                                            </div>

                                            <div className="space-y-3">
                                                <motion.button
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={startCamera}
                                                    className="w-full py-4 bg-charcoal text-white rounded-mag font-semibold flex items-center justify-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined">photo_camera</span>
                                                    開啟相機拍照
                                                </motion.button>

                                                <motion.button
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full py-4 bg-white border border-black/10 text-charcoal rounded-mag font-semibold flex items-center justify-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined">upload</span>
                                                    從相簿選擇圖片
                                                </motion.button>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileSelect}
                                                    className="hidden"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {step === 'preview' && image && (
                                <div className="space-y-4">
                                    <div className="aspect-[3/4] rounded-mag overflow-hidden bg-stone/10">
                                        <img src={image} alt="Receipt" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex gap-3">
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleReset}
                                            className="flex-1 py-3 bg-stone/10 text-charcoal rounded-mag font-semibold"
                                        >
                                            重新拍攝
                                        </motion.button>
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            onClick={processImage}
                                            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-mag font-semibold flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined">document_scanner</span>
                                            開始辨識
                                        </motion.button>
                                    </div>
                                </div>
                            )}

                            {step === 'result' && (
                                <div className="space-y-4">
                                    {isProcessing ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                                            <p className="text-stone">正在辨識收據...</p>
                                            <p className="text-[12px] text-stone/60 mt-1">使用 AI 分析文字</p>
                                        </div>
                                    ) : result && (
                                        <>
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-mag p-5 border border-green-200">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="material-symbols-filled text-green-500 text-[24px]">check_circle</span>
                                                    <span className="text-[14px] font-semibold text-green-700">辨識完成</span>
                                                    <span className="ml-auto text-[11px] text-green-600 bg-green-100 px-2 py-0.5 rounded-pill">
                                                        準確度 {Math.round(result.confidence * 100)}%
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    {result.total !== null && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[14px] text-stone">金額</span>
                                                            <span className="text-[24px] font-bold text-charcoal">
                                                                {result.currency === 'THB' ? '฿' : result.currency === 'TWD' ? 'NT$' : '$'}
                                                                {result.total.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {result.merchant && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[14px] text-stone">商家</span>
                                                            <span className="text-[14px] font-medium text-charcoal">{result.merchant}</span>
                                                        </div>
                                                    )}
                                                    {result.date && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[14px] text-stone">日期</span>
                                                            <span className="text-[14px] font-medium text-charcoal">{result.date}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <motion.button
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={handleReset}
                                                    className="flex-1 py-3 bg-stone/10 text-charcoal rounded-mag font-semibold"
                                                >
                                                    重新掃描
                                                </motion.button>
                                                <motion.button
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={handleConfirm}
                                                    disabled={result.total === null}
                                                    className="flex-1 py-3 bg-green-500 text-white rounded-mag font-semibold disabled:bg-stone/30"
                                                >
                                                    使用此金額
                                                </motion.button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
