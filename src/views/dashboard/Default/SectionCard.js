import { Card, CardContent, Typography } from '@mui/material';

const SectionCard = ({ title, children }) => {
    return (
        <Card elevation={1} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
                <Typography fontWeight={600} mb={2}>
                    {title}
                </Typography>
                {children}
            </CardContent>
        </Card>
    );
};

export default SectionCard;
