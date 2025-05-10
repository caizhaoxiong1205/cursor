// 获取DOM元素
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const uploadSection = document.getElementById('upload-section');
const compressionSection = document.getElementById('compression-section');
const batchSection = document.getElementById('batch-section');
const qualitySlider = document.getElementById('quality-slider');
const qualityValue = document.getElementById('quality-value');
const batchQualitySlider = document.getElementById('batch-quality-slider');
const batchQualityValue = document.getElementById('batch-quality-value');
const compressBtn = document.getElementById('compress-btn');
const resetBtn = document.getElementById('reset-btn');
const batchCompressBtn = document.getElementById('batch-compress-btn');
const batchResetBtn = document.getElementById('batch-reset-btn');
const downloadBtn = document.getElementById('download-btn');
const batchDownloadBtn = document.getElementById('batch-download-btn');
const originalImage = document.getElementById('original-image');
const compressedImage = document.getElementById('compressed-image');
const originalSize = document.getElementById('original-size');
const compressedSize = document.getElementById('compressed-size');
const compressionRate = document.getElementById('compression-rate');
const batchFilesList = document.getElementById('batch-files-list');
const fileCount = document.getElementById('file-count');
const totalCompressionRate = document.getElementById('total-compression-rate');

// 全局变量
let originalFile = null;
let compressedFile = null;
let batchFiles = []; // 存储批量处理的文件
let compressedBatchFiles = []; // 存储批量压缩后的文件

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化事件监听器
    initEventListeners();
});

// 初始化事件监听器
function initEventListeners() {
    // 文件上传区域拖放事件
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            handleFilesUpload(e.dataTransfer.files);
        }
    });

    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // 文件选择事件
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFilesUpload(e.target.files);
        }
    });

    // 质量滑块事件
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = `${qualitySlider.value}%`;
    });

    batchQualitySlider.addEventListener('input', () => {
        batchQualityValue.textContent = `${batchQualitySlider.value}%`;
    });

    // 压缩按钮事件
    compressBtn.addEventListener('click', compressImage);
    batchCompressBtn.addEventListener('click', batchCompressImages);

    // 重置按钮事件
    resetBtn.addEventListener('click', resetApp);
    batchResetBtn.addEventListener('click', resetApp);

    // 下载按钮事件
    downloadBtn.addEventListener('click', downloadImage);
    batchDownloadBtn.addEventListener('click', downloadAllImages);
}

// 处理文件上传（支持单个或多个文件）
function handleFilesUpload(files) {
    // 检查是否有文件
    if (!files || files.length === 0) return;
    
    // 如果只有一个文件，使用单文件模式
    if (files.length === 1) {
        handleSingleFileUpload(files[0]);
    } else {
        // 多个文件，使用批量模式
        handleBatchFilesUpload(files);
    }
}

// 处理单个文件上传
function handleSingleFileUpload(file) {
    // 检查文件类型
    if (!isValidImageFile(file)) {
        alert('请上传 PNG 或 JPG 格式的图片！');
        return;
    }

    originalFile = file;
    
    // 显示原始图片
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage.src = e.target.result;
        
        // 显示原始文件大小
        originalSize.textContent = formatFileSize(file.size);
        
        // 显示压缩区域
        uploadSection.style.display = 'none';
        compressionSection.style.display = 'block';
        batchSection.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// 处理批量文件上传
function handleBatchFilesUpload(files) {
    // 重置批量文件数组
    batchFiles = [];
    compressedBatchFiles = [];
    
    // 过滤出有效的图片文件
    for (let i = 0; i < files.length; i++) {
        if (isValidImageFile(files[i])) {
            batchFiles.push({
                file: files[i],
                id: generateUniqueId(),
                status: 'pending', // pending, processing, completed, error
                originalSize: files[i].size,
                compressedSize: 0,
                compressionRate: 0,
                compressedFile: null
            });
        }
    }
    
    // 如果没有有效文件，提示用户
    if (batchFiles.length === 0) {
        alert('请上传 PNG 或 JPG 格式的图片！');
        return;
    }
    
    // 更新文件计数
    fileCount.textContent = batchFiles.length;
    
    // 渲染批量文件列表
    renderBatchFilesList();
    
    // 显示批量处理区域
    uploadSection.style.display = 'none';
    compressionSection.style.display = 'none';
    batchSection.style.display = 'block';
}

// 检查文件是否为有效的图片文件
function isValidImageFile(file) {
    return file.type.match('image/jpeg') || file.type.match('image/png');
}

// 生成唯一ID
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 渲染批量文件列表
function renderBatchFilesList() {
    batchFilesList.innerHTML = '';
    
    batchFiles.forEach(fileObj => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.id = `file-${fileObj.id}`;
        
        // 创建文件预览
        const filePreview = document.createElement('div');
        filePreview.className = 'file-preview';
        
        // 创建预览图片
        const img = document.createElement('img');
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(fileObj.file);
        filePreview.appendChild(img);
        
        // 创建文件信息
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        
        const fileName = document.createElement('div');
        fileName.className = 'file-name';
        fileName.textContent = fileObj.file.name;
        
        const fileSize = document.createElement('div');
        fileSize.className = 'file-size';
        fileSize.textContent = formatFileSize(fileObj.originalSize);
        
        fileInfo.appendChild(fileName);
        fileInfo.appendChild(fileSize);
        
        // 创建文件状态
        const fileStatus = document.createElement('div');
        fileStatus.className = 'file-status';
        
        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge status-${fileObj.status}`;
        
        switch (fileObj.status) {
            case 'pending':
                statusBadge.textContent = '待处理';
                break;
            case 'processing':
                statusBadge.textContent = '处理中';
                break;
            case 'completed':
                statusBadge.textContent = '已完成';
                break;
            case 'error':
                statusBadge.textContent = '错误';
                break;
        }
        
        fileStatus.appendChild(statusBadge);
        
        // 创建压缩信息
        const compressionInfo = document.createElement('div');
        compressionInfo.className = 'compression-info';
        
        if (fileObj.status === 'completed') {
            const compressedSizeInfo = document.createElement('div');
            compressedSizeInfo.textContent = formatFileSize(fileObj.compressedSize);
            
            const compressionRateInfo = document.createElement('div');
            compressionRateInfo.className = 'compression-rate';
            compressionRateInfo.textContent = `节省 ${fileObj.compressionRate}%`;
            
            compressionInfo.appendChild(compressedSizeInfo);
            compressionInfo.appendChild(compressionRateInfo);
        }
        
        // 组装文件项
        fileItem.appendChild(filePreview);
        fileItem.appendChild(fileInfo);
        fileItem.appendChild(fileStatus);
        fileItem.appendChild(compressionInfo);
        
        batchFilesList.appendChild(fileItem);
    });
}

// 批量压缩图片
async function batchCompressImages() {
    if (batchFiles.length === 0) return;
    
    try {
        // 禁用压缩按钮，显示加载状态
        batchCompressBtn.disabled = true;
        batchCompressBtn.innerHTML = '<span class="loading-spinner"></span>批量压缩中...';
        
        // 获取压缩质量
        const quality = parseInt(batchQualitySlider.value) / 100;
        
        // 压缩选项
        const options = {
            maxSizeMB: 10, // 最大文件大小
            maxWidthOrHeight: 1920, // 最大宽度或高度
            useWebWorker: true, // 使用Web Worker
            quality: quality // 压缩质量
        };
        
        // 重置压缩后的文件数组
        compressedBatchFiles = [];
        
        // 计算总的原始大小
        let totalOriginalSize = 0;
        let totalCompressedSize = 0;
        
        // 逐个压缩文件
        for (let i = 0; i < batchFiles.length; i++) {
            const fileObj = batchFiles[i];
            
            // 更新状态为处理中
            fileObj.status = 'processing';
            updateFileItemStatus(fileObj.id, 'processing');
            
            try {
                // 执行压缩
                const compressedFile = await imageCompression(fileObj.file, options);
                
                // 更新文件对象
                fileObj.compressedFile = compressedFile;
                fileObj.compressedSize = compressedFile.size;
                fileObj.compressionRate = Math.round((1 - (compressedFile.size / fileObj.originalSize)) * 100);
                fileObj.status = 'completed';
                
                // 添加到压缩后的文件数组
                compressedBatchFiles.push({
                    originalName: fileObj.file.name,
                    compressedFile: compressedFile
                });
                
                // 更新总大小计算
                totalOriginalSize += fileObj.originalSize;
                totalCompressedSize += fileObj.compressedSize;
                
                // 更新UI
                updateFileItemStatus(fileObj.id, 'completed', fileObj.compressedSize, fileObj.compressionRate);
            } catch (error) {
                console.error(`压缩文件 ${fileObj.file.name} 时出错:`, error);
                fileObj.status = 'error';
                updateFileItemStatus(fileObj.id, 'error');
            }
        }
        
        // 计算总压缩率
        const totalRate = Math.round((1 - (totalCompressedSize / totalOriginalSize)) * 100);
        totalCompressionRate.textContent = `${totalRate}%`;
        
        // 启用下载按钮
        batchDownloadBtn.disabled = false;
    } catch (error) {
        console.error('批量压缩过程中出错:', error);
        alert('批量压缩过程中出错，请重试！');
    } finally {
        // 恢复压缩按钮状态
        batchCompressBtn.disabled = false;
        batchCompressBtn.innerHTML = '批量压缩';
    }
}

// 更新文件项状态
function updateFileItemStatus(fileId, status, compressedSize = 0, compressionRate = 0) {
    const fileItem = document.getElementById(`file-${fileId}`);
    if (!fileItem) return;
    
    // 更新状态标签
    const statusBadge = fileItem.querySelector('.status-badge');
    statusBadge.className = `status-badge status-${status}`;
    
    switch (status) {
        case 'pending':
            statusBadge.textContent = '待处理';
            break;
        case 'processing':
            statusBadge.textContent = '处理中';
            break;
        case 'completed':
            statusBadge.textContent = '已完成';
            break;
        case 'error':
            statusBadge.textContent = '错误';
            break;
    }
    
    // 如果是完成状态，更新压缩信息
    if (status === 'completed') {
        const compressionInfo = fileItem.querySelector('.compression-info');
        compressionInfo.innerHTML = '';
        
        const compressedSizeInfo = document.createElement('div');
        compressedSizeInfo.textContent = formatFileSize(compressedSize);
        
        const compressionRateInfo = document.createElement('div');
        compressionRateInfo.className = 'compression-rate';
        compressionRateInfo.textContent = `节省 ${compressionRate}%`;
        
        compressionInfo.appendChild(compressedSizeInfo);
        compressionInfo.appendChild(compressionRateInfo);
    }
}

// 下载所有压缩后的图片（打包为ZIP）
async function downloadAllImages() {
    if (compressedBatchFiles.length === 0) return;
    
    try {
        // 禁用下载按钮，显示加载状态
        batchDownloadBtn.disabled = true;
        batchDownloadBtn.innerHTML = '<span class="loading-spinner"></span>打包下载中...';
        
        // 创建ZIP文件
        const zip = new JSZip();
        
        // 添加所有压缩后的文件到ZIP
        for (const fileObj of compressedBatchFiles) {
            const originalName = fileObj.originalName;
            const nameParts = originalName.split('.');
            const extension = fileObj.compressedFile.type.split('/')[1];
            const baseName = nameParts.slice(0, -1).join('.');
            const newFileName = `${baseName}_compressed.${extension}`;
            
            // 添加文件到ZIP
            zip.file(newFileName, fileObj.compressedFile);
        }
        
        // 生成ZIP文件
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        // 下载ZIP文件
        saveAs(zipBlob, 'compressed_images.zip');
    } catch (error) {
        console.error('打包下载过程中出错:', error);
        alert('打包下载过程中出错，请重试！');
    } finally {
        // 恢复下载按钮状态
        batchDownloadBtn.disabled = false;
        batchDownloadBtn.innerHTML = '<i class="fas fa-download"></i> 批量下载';
    }
}

// 压缩单张图片
async function compressImage() {
    if (!originalFile) return;

    try {
        // 禁用压缩按钮，显示加载状态
        compressBtn.disabled = true;
        compressBtn.textContent = '压缩中...';
        
        // 获取压缩质量
        const quality = parseInt(qualitySlider.value) / 100;
        
        // 压缩选项
        const options = {
            maxSizeMB: 10, // 最大文件大小
            maxWidthOrHeight: 1920, // 最大宽度或高度
            useWebWorker: true, // 使用Web Worker
            quality: quality // 压缩质量
        };
        
        // 执行压缩
        compressedFile = await imageCompression(originalFile, options);
        
        // 显示压缩后的图片
        const reader = new FileReader();
        reader.onload = (e) => {
            compressedImage.src = e.target.result;
            
            // 显示压缩后文件大小
            compressedSize.textContent = formatFileSize(compressedFile.size);
            
            // 计算压缩率
            const rate = 100 - Math.round((compressedFile.size / originalFile.size) * 100);
            compressionRate.textContent = `${rate}%`;
            
            // 启用下载按钮
            downloadBtn.disabled = false;
        };
        reader.readAsDataURL(compressedFile);
    } catch (error) {
        console.error('压缩过程中出错:', error);
        alert('压缩过程中出错，请重试！');
    } finally {
        // 恢复压缩按钮状态
        compressBtn.disabled = false;
        compressBtn.textContent = '压缩图片';
    }
}

// 重置应用
function resetApp() {
    // 重置文件
    originalFile = null;
    compressedFile = null;
    batchFiles = [];
    compressedBatchFiles = [];
    
    // 重置图片
    originalImage.src = '';
    compressedImage.src = '';
    
    // 重置文件大小
    originalSize.textContent = '0 KB';
    compressedSize.textContent = '0 KB';
    compressionRate.textContent = '0%';
    totalCompressionRate.textContent = '0%';
    
    // 重置质量滑块
    qualitySlider.value = 80;
    qualityValue.textContent = '80%';
    batchQualitySlider.value = 80;
    batchQualityValue.textContent = '80%';
    
    // 禁用下载按钮
    downloadBtn.disabled = true;
    batchDownloadBtn.disabled = true;
    
    // 清空批量文件列表
    batchFilesList.innerHTML = '';
    fileCount.textContent = '0';
    
    // 显示上传区域，隐藏压缩区域
    uploadSection.style.display = 'block';
    compressionSection.style.display = 'none';
    batchSection.style.display = 'none';
    
    // 重置文件输入
    fileInput.value = '';
}

// 下载单张压缩后的图片
function downloadImage() {
    if (!compressedFile) return;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(compressedFile);
    
    // 生成文件名
    const extension = compressedFile.type.split('/')[1];
    const originalName = originalFile.name.split('.')[0];
    link.download = `${originalName}_compressed.${extension}`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 