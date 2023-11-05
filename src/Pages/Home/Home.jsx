import React, { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import Sort from "./Sort";
import { Card, Checkbox } from "@nextui-org/react";
import ImageCard from "../ImaageCard/ImageCard";
import { FaImage } from "react-icons/fa";
import addImage from "../../../public/images/4148851.png";

const Home = () => {
  const [deletedImg, setDeletedImg] = useState([]);
  const [images, setImages] = useState([]);
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);


  // get images from server
  useEffect(() => {
    fetch("https://image-gallery-server-mocha.vercel.app/photos")
      .then((response) => response.json())
      .then((data) => {
        setImages(data);
        setItems(data.map((image) => image.photo));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);


  // deleted images

  const handleDeleteImg = async () => {
    if (deletedImg.length === 0) {
      return;
    }

    try {
      const response = await fetch("https://image-gallery-server-mocha.vercel.app/photos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photoUrls: deletedImg }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.message === "Selected photos deleted successfully") {
          const filteredArray1 = items.filter(
            (item) => !deletedImg.includes(item)
          );
          setDeletedImg([]);
          setItems(filteredArray1);
        } else {
          console.error("Failed to delete selected photos");
        }
      } else {
        console.error(
          "Server responded with an error status:",
          response.status
        );
        console.error(await response.text());
      }
    } catch (error) {
      console.error("Error while handling photo deletion:", error);
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // drag and drop

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active?.id);
        const newIndex = items.indexOf(over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);


  // upload images

  const handleImageUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    // Upload the image to imgBB
    const imgbbApiKey = import.meta.env.VITE_IMAGE_UPLOAD_TOKEN;
    const formData = new FormData();
    formData.append("image", file);

    try {
      const imgbbResponse = await fetch(
        "https://api.imgbb.com/1/upload?key=" + imgbbApiKey,
        {
          method: "POST",
          body: formData,
        }
      );

      if (imgbbResponse.ok) {
        const imgbbData = await imgbbResponse.json();
        const imgUrl = imgbbData.data.url;

        const apiUrl = "https://image-gallery-server-mocha.vercel.app/photos";
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ photo: imgUrl }),
        });

        if (response.ok) {
          const newPhoto = await response.json();

          console.log("Image uploaded and URL sent to your API:", newPhoto);
        }
      } else {
        console.error("Failed to upload image to imgBB.");
      }
    } catch (error) {
      console.error("Error while handling image upload:", error);
    }
  };

  return (
    <div className="lg:w-[1236px] container mx-auto bg-[#fafafa]">
      <Card className="p-4 md:p-8 mx-4 md:mx-0 my-8">
        <div className="flex justify-between pb-3 border-b ">
          {deletedImg.length === 0 ? (
            <h3 className="text-2xl uppercase font-semibold text-black">
              Gallery
            </h3>
          ) : (
            <div className="flex justify-center items-center gap-1">
              <Checkbox isSelected={true}></Checkbox>{" "}
              <p className="text-lg md:text-xl uppercase font-semibold text-black">
                {deletedImg.length} Image Selected
              </p>
            </div>
          )}
          {deletedImg.length === 1 && (
            <p
              onClick={handleDeleteImg}
              className="float-right cursor-pointer text-[20px] text-red-500 font-semibold"
            >
              Delete File
            </p>
          )}
          {deletedImg.length > 1 && (
            <p
              onClick={handleDeleteImg}
              className="float-right cursor-pointer text-[20px] text-red-500 font-semibold"
            >
              Delete Files
            </p>
          )}
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {/* loading content */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mx-auto mt-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((index) => (
                <div key={index} className="skeleton-card"></div>
              ))}
            </div>
          ) : (
            <SortableContext items={items} strategy={rectSortingStrategy}>
              {items.length !== 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mx-auto mt-6">
                  {items.map((photo, index) => (
                    <Sort
                      key={index}
                      deletedImg={deletedImg}
                      setDeletedImg={setDeletedImg}
                      index={index}
                      id={photo}
                    />
                  ))}
                  <div className="w-[200px] flex flex-col gap-2 rounded-[10px] cursor-pointer border-2 border-slate-300 justify-center items-center h-[200px] bg-slate-100">
                    <label htmlFor="image-upload" style={{ cursor: "pointer" }}>
                      {/* I apply image icon and text but this design look bad then i applay a image */}
                      {/* <span className=" text-[25px]"><FaImage></FaImage></span>
                      <h4>Add Images</h4> */}
                      <img src={addImage} alt="" />
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="w-[400px] h-[400px] mt-6 gap-2 rounded-[10px] cursor-pointer border-2 border-slate-300 justify-center items-center bg-slate-100">
                    <label htmlFor="image-upload" style={{ cursor: "pointer" }}>
                      <img src={addImage} alt="" />
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              )}
            </SortableContext>
          )}
          <DragOverlay adjustScale style={{ transformOrigin: "0 0 " }}>
            {activeId ? <ImageCard id={activeId} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </Card>
    </div>
  );
};

export default Home;
