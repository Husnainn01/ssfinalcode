"use client";
import { useState, useCallback, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function ImageUpload({ onImagesSelected, resetTrigger }) {
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [error, setError] = useState(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  useEffect(() => {
    if (resetTrigger) {
      setFiles([]);
      setPreviewUrls([]);
      setMainImageIndex(0);
      setError(null);
    }
  }, [resetTrigger]);

  const MAX_IMAGES = 30;

  const onDrop = useCallback(acceptedFiles => {
    const totalImages = files.length + acceptedFiles.length;
    
    if (totalImages > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);

    const newPreviews = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file)
    }));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
    
    onImagesSelected({ files: newFiles, mainImageIndex });
    setError(null);
  }, [files, mainImageIndex, onImagesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: true
  });

  const removeImage = (indexToRemove) => {
    const newFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(newFiles);

    const newUrls = previewUrls.filter((_, index) => index !== indexToRemove);
    setPreviewUrls(newUrls);

    if (indexToRemove === mainImageIndex) {
      setMainImageIndex(0);
    } else if (indexToRemove < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    }

    onImagesSelected({ files: newFiles, mainImageIndex: indexToRemove === mainImageIndex ? 0 : mainImageIndex > indexToRemove ? mainImageIndex - 1 : mainImageIndex });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const newPreviewUrls = Array.from(previewUrls);
    const newFiles = Array.from(files);

    const [movedPreview] = newPreviewUrls.splice(source.index, 1);
    const [movedFile] = newFiles.splice(source.index, 1);

    newPreviewUrls.splice(destination.index, 0, movedPreview);
    newFiles.splice(destination.index, 0, movedFile);

    setPreviewUrls(newPreviewUrls);
    setFiles(newFiles);

    if (source.index === mainImageIndex) {
      setMainImageIndex(destination.index);
    } else if (
      source.index < mainImageIndex && 
      destination.index >= mainImageIndex
    ) {
      setMainImageIndex(mainImageIndex - 1);
    } else if (
      source.index > mainImageIndex && 
      destination.index <= mainImageIndex
    ) {
      setMainImageIndex(mainImageIndex + 1);
    }

    onImagesSelected({ files: newFiles, mainImageIndex });
  };

  const setAsMainImage = (index) => {
    setMainImageIndex(index);
    onImagesSelected({ files, mainImageIndex: index });
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800">Upload Images</h3>
        <p className="text-sm text-gray-500">
          Drag and drop your images or click to select files. You can reorder them by dragging.
          <span className="text-primary ml-1">
            ({previewUrls.length}/{MAX_IMAGES} images)
          </span>
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out
          ${isDragActive 
            ? 'border-primary bg-primary/5 scale-98' 
            : 'border-gray-200 hover:border-primary hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className={`
              p-4 rounded-full bg-gray-50 transition-transform duration-200
              ${isDragActive ? 'scale-110' : ''}
            `}>
              <svg
                className={`
                  w-8 h-8 transition-colors duration-200
                  ${isDragActive ? 'text-primary' : 'text-gray-400'}
                `}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-gray-700">
              Drop your images here
            </p>
            <p className="text-xs text-gray-500">
              Supports: JPG, PNG, JPEG
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="images" direction="horizontal">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`
                flex flex-wrap gap-4 p-4 rounded-lg transition-colors duration-200
                max-h-[400px] overflow-y-auto
                ${snapshot.isDraggingOver ? 'bg-gray-50' : 'bg-transparent'}
              `}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#CBD5E1 transparent'
              }}
            >
              {previewUrls.map((preview, index) => (
                <Draggable 
                  key={preview.id} 
                  draggableId={preview.id} 
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`
                        relative group w-[200px] h-[200px] flex-shrink-0
                        transition-all duration-200 ease-in-out
                        rounded-xl overflow-hidden
                        ${snapshot.isDragging 
                          ? 'z-50 shadow-2xl scale-105' 
                          : 'hover:shadow-lg'
                        }
                        ${index === mainImageIndex ? 'ring-4 ring-primary ring-offset-2' : ''}
                      `}
                      style={{
                        ...provided.draggableProps.style,
                        transform: snapshot.isDragging 
                          ? provided.draggableProps.style?.transform 
                          : 'none',
                      }}
                      onClick={() => setAsMainImage(index)}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          fill
                          className={`
                            object-cover transition-transform duration-200
                            ${snapshot.isDragging ? 'scale-105' : 'group-hover:scale-105'}
                          `}
                          draggable={false}
                          priority
                        />
                        <div className={`
                          absolute inset-0 bg-gradient-to-t from-black/50 to-transparent
                          transition-opacity duration-200
                          ${snapshot.isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                        `} />
                        {index === mainImageIndex && (
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 text-xs font-medium rounded-full shadow-sm">
                            Main Image
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500 hover:text-white"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            Click to set as main image
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
} 