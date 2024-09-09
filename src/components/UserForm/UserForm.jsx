import React from "react";
import { useForm } from "react-hook-form";
import s from "./UserForm.module.css";

const UserForm = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={s.form}>
      <div className={s.formGroup}>
        <label className={s.label} htmlFor="name">
          Name:
        </label>
        <input
          className={s.input}
          id="name"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <span className={s.error}>{errors.name.message}</span>}
      </div>

      <div className={s.formGroup}>
        <label className={s.label} htmlFor="complexity">
          Complexity:
        </label>
        <select
          className={s.input}
          id="complexity"
          {...register("complexity", { required: "Complexity is required" })}
        >
          {[...Array(10).keys()].map((i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
        {errors.complexity && (
          <span className={s.error}>{errors.complexity.message}</span>
        )}
      </div>

      <button type="submit" className={s.button}>
        Submit
      </button>
    </form>
  );
};

export default UserForm;
