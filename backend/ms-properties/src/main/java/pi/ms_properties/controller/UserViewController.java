package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.domain.UserView;
import pi.ms_properties.service.interf.IUserViewService;

@RestController
@RequestMapping("/userViews")
@RequiredArgsConstructor
public class UserViewController {

    private final IUserViewService userViewService;

    @PostMapping("/create")
    public void create(@RequestBody UserView userView) {
        userViewService.create(userView);
    }
}

