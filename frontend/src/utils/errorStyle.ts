export const getErrorStyles = (error: boolean) => ({
  "& .MuiInputLabel-root": {
    color: error ? "red" : "", // Cambia el color del label cuando hay error
  },
  "& .MuiOutlinedInput-root": {
    borderColor: error ? "red" : "", // Cambia el color del borde cuando hay error
  },
});
