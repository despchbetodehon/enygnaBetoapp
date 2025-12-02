export default class Cpf {
    private static _padraoCpf = '???.???.???-??'
    private static _padraoCnpj = '??.???.???/????-??'
    
    static formatar(valor: string): string {
        const nums = Cpf.desformatar(valor).split('')
        const padrao = nums.length > 11 ? Cpf._padraoCnpj : Cpf._padraoCpf
        return nums.reduce((formatado: string, num: string) => {
            return formatado.replace('?', num)
        }, padrao).split('?')[0].replace(/[-./]$/, '')
    }

    static formatarCpfCnpj(valor: string): string {
        if (!valor) return ''
        const nums = Cpf.desformatar(valor)
        
        if (nums.length === 11) {
            // CPF: 999.999.999-99
            return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        } else if (nums.length === 14) {
            // CNPJ: 99.999.999/9999-99
            return nums.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
        }
        
        return valor
    }

    static desformatar(valor: string): string {
        return valor.replace(/[^0-9]+/g, '')
    }
}