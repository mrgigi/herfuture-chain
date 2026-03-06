const supabase = require('./src/services/supabaseService');
require('dotenv').config();

async function checkStudent() {
    const phone = '0739039856';
    console.log(`Checking for student: ${phone}`);
    const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('phone', phone);

    if (error) {
        console.error('Error fetching student:', error);
        return;
    }

    if (data.length === 0) {
        console.log('Student not found in database.');
        const { data: all } = await supabase.from('participants').select('phone').limit(5);
        console.log('Sample phone numbers in DB:', all.map(p => p.phone));
    } else {
        console.log('Student found:', data[0]);
    }
}

checkStudent();
