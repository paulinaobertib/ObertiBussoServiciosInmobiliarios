package pi.ms_properties.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_properties.controller.CommentController;
import pi.ms_properties.dto.CommentDTO;
import pi.ms_properties.service.impl.CommentService;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CommentController.class)
@RequiredArgsConstructor
class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Mock
    private CommentService commentService;

    private final ObjectMapper objectMapper;

    private CommentDTO commentDTO;

    @BeforeEach
    void setup() {
        commentDTO = new CommentDTO();
        commentDTO.setId(1L);
        commentDTO.setDescription("Muy buena propiedad");
        commentDTO.setPropertyId(100L);
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "admin")
    void createComment_success() throws Exception {
        Mockito.when(commentService.create(any())).thenReturn(ResponseEntity.ok("Comentario creado"));

        mockMvc.perform(post("/comment/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("Comentario creado"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateComment_success() throws Exception {
        Mockito.when(commentService.update(any())).thenReturn(ResponseEntity.ok("Comentario actualizado"));

        mockMvc.perform(put("/comment/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("Comentario actualizado"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void deleteComment_success() throws Exception {
        Mockito.when(commentService.delete(1L)).thenReturn(ResponseEntity.ok("Comentario eliminado"));

        mockMvc.perform(delete("/comment/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Comentario eliminado"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getCommentById_success() throws Exception {
        Mockito.when(commentService.getById(1L)).thenReturn(ResponseEntity.ok(commentDTO));

        mockMvc.perform(get("/comment/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Muy buena propiedad"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getByPropertyId_success() throws Exception {
        List<CommentDTO> comments = Arrays.asList(commentDTO);
        Mockito.when(commentService.getByPropertyId(100L)).thenReturn(ResponseEntity.ok(comments));

        mockMvc.perform(get("/comment/property/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }

    // casos de error

    @Test
    void createComment_unauthorized() throws Exception {
        mockMvc.perform(post("/comment/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "admin")
    void createComment_missingField() throws Exception {
        commentDTO.setDescription(null); // campo requerido omitido

        mockMvc.perform(post("/comment/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentDTO)))
                .andExpect(status().isOk()); // depende de tu lógica, cambiar si hay validaciones
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateComment_serviceThrowsException() throws Exception {
        doThrow(new RuntimeException("Error al actualizar")).when(commentService).update(any());

        mockMvc.perform(put("/comment/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentDTO)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = "admin")
    void getById_notFound() throws Exception {
        Mockito.when(commentService.getById(999L)).thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(get("/comment/getById/999"))
                .andExpect(status().isNotFound());
    }
}
