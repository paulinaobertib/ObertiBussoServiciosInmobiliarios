import { List, ListItem, ListItemText, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { adaptDataForList } from '../utils/adapter.ts'

interface CategoryListProps {
    category: string;
    data: any[];
}

const ListGetCRUD = ({ category, data }: CategoryListProps) => {
    const adaptedData = adaptDataForList(category, data);


    return (
        <>
            <List>
                {adaptedData.map((item: any) => (
                    <ListItem key={item.id}>
                        <ListItemText primary={item.name} />
                        <IconButton> <AddCircleOutlineIcon /> </IconButton>
                        <IconButton> <EditIcon /></IconButton>
                        <IconButton> <DeleteIcon /> </IconButton>
                    </ListItem>
                ))}
            </List>
        </>
    );
};

export default ListGetCRUD;
