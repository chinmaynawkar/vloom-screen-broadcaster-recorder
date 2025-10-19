import Image from "next/image";

/**
 * FileInput component
 *
  @param id - The id of the file input.
  @param label - The label of the file input.
  @param accept - The accept attribute of the file input.
  @param file - The file object.
  @param previewUrl - The preview URL of the file.
  @param inputRef - The ref of the file input.
  @param onChange - The onChange handler of the file input.
  @param onReset - The onReset handler of the file input.
  @param type - The type of the file input.
 */

const FileInput = ({
  id,
  label,
  accept,
  file,
  previewUrl,
  inputRef,
  onChange,
  onReset,
  type,
}: FileInputProps) => (
  <section className="file-input">
    <label htmlFor={id}>{label}</label>
    <input
      type="file"
      id={id}
      accept={accept}
      hidden
      ref={inputRef}
      onChange={onChange}
    />

    {!previewUrl ? (
      <figure onClick={() => inputRef.current?.click()}>
        <Image
          src="/assets/icons/upload.svg"
          alt="Upload Icon"
          width={24}
          height={24}
        />
        <p>click to upload your {id}</p>
      </figure>
    ) : (
      <div>
        {type === "video" ? (
          <video src={previewUrl} controls />
        ) : (
          <Image src={previewUrl} alt={`Selected ${id}`} fill />
        )}
        <button type="button" onClick={onReset}>
          <Image
            src="/assets/icons/close.svg"
            alt="Close Icon"
            width={16}
            height={16}
          />
        </button>
        <p>{file?.name}</p>
      </div>
    )}
  </section>
);

export default FileInput;
